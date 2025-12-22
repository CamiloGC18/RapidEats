const SupportTicket = require('../models/SupportTicket');
const FAQ = require('../models/FAQ');
const { AppError } = require('../utils/errors');

/**
 * Crear nuevo ticket de soporte
 */
exports.createTicket = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { category, priority, subject, description, order, attachments, metadata } = req.body;
    
    if (!category || !subject || !description) {
      throw new AppError('Categoría, asunto y descripción son requeridos', 400);
    }
    
    const ticket = await SupportTicket.create({
      user: userId,
      category,
      priority: priority || 'medium',
      subject,
      description,
      order,
      attachments,
      metadata
    });
    
    await ticket.populate('user', 'name email');
    
    // Enviar notificación al equipo de soporte (implementar)
    
    res.status(201).json({
      success: true,
      message: 'Ticket creado exitosamente',
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener tickets del usuario
 */
exports.getUserTickets = async (req, res, next) => {
  try {
    const userId = req.user._id;
    const { status, category, page = 1, limit = 20 } = req.query;
    
    const filter = { user: userId };
    if (status) filter.status = status;
    if (category) filter.category = category;
    
    const tickets = await SupportTicket.find(filter)
      .sort({ createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('assignedTo', 'name')
      .select('-messages'); // No incluir mensajes en la lista
    
    const total = await SupportTicket.countDocuments(filter);
    
    res.json({
      success: true,
      data: {
        tickets,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener ticket por ID
 */
exports.getTicketById = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user._id;
    
    const ticket = await SupportTicket.findById(ticketId)
      .populate('user', 'name email picture')
      .populate('assignedTo', 'name email')
      .populate('messages.sender', 'name picture')
      .populate('order');
    
    if (!ticket) {
      throw new AppError('Ticket no encontrado', 404);
    }
    
    // Verificar acceso
    if (ticket.user._id.toString() !== userId.toString() && 
        req.user.role !== 'admin' && 
        req.user.role !== 'support') {
      throw new AppError('No tienes acceso a este ticket', 403);
    }
    
    res.json({
      success: true,
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Agregar mensaje a ticket
 */
exports.addMessage = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user._id;
    const { message, attachments } = req.body;
    
    if (!message) {
      throw new AppError('Mensaje requerido', 400);
    }
    
    const ticket = await SupportTicket.findById(ticketId);
    
    if (!ticket) {
      throw new AppError('Ticket no encontrado', 404);
    }
    
    // Verificar acceso
    if (ticket.user.toString() !== userId.toString() && 
        req.user.role !== 'admin' && 
        req.user.role !== 'support') {
      throw new AppError('No tienes acceso a este ticket', 403);
    }
    
    const senderRole = req.user.role === 'admin' || req.user.role === 'support' ? 'support' : 'customer';
    ticket.addMessage(userId, senderRole, message, attachments);
    
    // Si el cliente responde, cambiar estado
    if (senderRole === 'customer' && ticket.status === 'waiting_customer') {
      ticket.status = 'in_progress';
    }
    
    await ticket.save();
    await ticket.populate('messages.sender', 'name picture');
    
    // Emitir evento de socket (implementar)
    const io = req.app.get('io');
    if (io) {
      io.to(`ticket_${ticketId}`).emit('newMessage', {
        ticketId,
        message: ticket.messages[ticket.messages.length - 1]
      });
    }
    
    res.json({
      success: true,
      message: 'Mensaje agregado',
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Actualizar estado de ticket
 */
exports.updateTicketStatus = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { status } = req.body;
    const userId = req.user._id;
    
    if (!status) {
      throw new AppError('Estado requerido', 400);
    }
    
    const ticket = await SupportTicket.findById(ticketId);
    
    if (!ticket) {
      throw new AppError('Ticket no encontrado', 404);
    }
    
    ticket.updateStatus(status, userId);
    await ticket.save();
    
    res.json({
      success: true,
      message: 'Estado actualizado',
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Calificar resolución de ticket
 */
exports.rateResolution = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const userId = req.user._id;
    const { rating, feedback } = req.body;
    
    if (!rating || rating < 1 || rating > 5) {
      throw new AppError('Rating debe estar entre 1 y 5', 400);
    }
    
    const ticket = await SupportTicket.findById(ticketId);
    
    if (!ticket) {
      throw new AppError('Ticket no encontrado', 404);
    }
    
    if (ticket.user.toString() !== userId.toString()) {
      throw new AppError('No tienes acceso a este ticket', 403);
    }
    
    if (ticket.status !== 'resolved' && ticket.status !== 'closed') {
      throw new AppError('El ticket debe estar resuelto para calificar', 400);
    }
    
    ticket.resolution.customerSatisfaction = {
      rating,
      feedback
    };
    
    await ticket.save();
    
    res.json({
      success: true,
      message: 'Calificación guardada',
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Obtener FAQs
 */
exports.getFAQs = async (req, res, next) => {
  try {
    const { category, search, language = 'es' } = req.query;
    
    const filter = { isActive: true, language };
    if (category) filter.category = category;
    
    let query = FAQ.find(filter).sort({ order: 1, createdAt: -1 });
    
    // Búsqueda por texto
    if (search) {
      query = FAQ.find({
        ...filter,
        $text: { $search: search }
      }).sort({ score: { $meta: 'textScore' } });
    }
    
    const faqs = await query;
    
    res.json({
      success: true,
      data: faqs
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Incrementar vistas de FAQ
 */
exports.incrementFAQViews = async (req, res, next) => {
  try {
    const { faqId } = req.params;
    
    await FAQ.findByIdAndUpdate(faqId, { $inc: { views: 1 } });
    
    res.json({
      success: true,
      message: 'Vista registrada'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Calificar FAQ como útil
 */
exports.rateFAQ = async (req, res, next) => {
  try {
    const { faqId } = req.params;
    const { helpful } = req.body;
    
    const update = helpful ? { $inc: { helpful: 1 } } : { $inc: { notHelpful: 1 } };
    
    await FAQ.findByIdAndUpdate(faqId, update);
    
    res.json({
      success: true,
      message: 'Calificación guardada'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Obtener todos los tickets
 */
exports.getAllTickets = async (req, res, next) => {
  try {
    const { status, priority, category, assignedTo, page = 1, limit = 50 } = req.query;
    
    const filter = {};
    if (status) filter.status = status;
    if (priority) filter.priority = priority;
    if (category) filter.category = category;
    if (assignedTo) filter.assignedTo = assignedTo;
    
    const tickets = await SupportTicket.find(filter)
      .sort({ priority: -1, createdAt: -1 })
      .limit(parseInt(limit))
      .skip((parseInt(page) - 1) * parseInt(limit))
      .populate('user', 'name email')
      .populate('assignedTo', 'name')
      .select('-messages');
    
    const total = await SupportTicket.countDocuments(filter);
    
    // Estadísticas
    const stats = await SupportTicket.aggregate([
      {
        $group: {
          _id: '$status',
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.json({
      success: true,
      data: {
        tickets,
        stats,
        pagination: {
          total,
          page: parseInt(page),
          pages: Math.ceil(total / parseInt(limit))
        }
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Asignar ticket
 */
exports.assignTicket = async (req, res, next) => {
  try {
    const { ticketId } = req.params;
    const { supportUserId } = req.body;
    
    const ticket = await SupportTicket.findById(ticketId);
    
    if (!ticket) {
      throw new AppError('Ticket no encontrado', 404);
    }
    
    ticket.assignTo(supportUserId);
    await ticket.save();
    
    res.json({
      success: true,
      message: 'Ticket asignado',
      data: ticket
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Crear FAQ
 */
exports.createFAQ = async (req, res, next) => {
  try {
    const faq = await FAQ.create(req.body);
    
    res.status(201).json({
      success: true,
      message: 'FAQ creado exitosamente',
      data: faq
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Actualizar FAQ
 */
exports.updateFAQ = async (req, res, next) => {
  try {
    const { faqId } = req.params;
    
    const faq = await FAQ.findByIdAndUpdate(faqId, req.body, { new: true });
    
    if (!faq) {
      throw new AppError('FAQ no encontrado', 404);
    }
    
    res.json({
      success: true,
      message: 'FAQ actualizado',
      data: faq
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Admin: Eliminar FAQ
 */
exports.deleteFAQ = async (req, res, next) => {
  try {
    const { faqId } = req.params;
    
    await FAQ.findByIdAndDelete(faqId);
    
    res.json({
      success: true,
      message: 'FAQ eliminado'
    });
  } catch (error) {
    next(error);
  }
};
