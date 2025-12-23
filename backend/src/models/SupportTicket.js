const mongoose = require('mongoose');

const supportTicketSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  ticketNumber: {
    type: String,
    unique: true,
    required: true
  },
  category: {
    type: String,
    enum: [
      'order_issue',
      'payment_issue',
      'delivery_issue',
      'restaurant_issue',
      'account_issue',
      'technical_issue',
      'general_inquiry',
      'complaint',
      'suggestion',
      'other'
    ],
    required: true
  },
  priority: {
    type: String,
    enum: ['low', 'medium', 'high', 'urgent'],
    default: 'medium'
  },
  status: {
    type: String,
    enum: ['open', 'in_progress', 'waiting_customer', 'resolved', 'closed'],
    default: 'open'
  },
  subject: {
    type: String,
    required: true,
    maxlength: 200
  },
  description: {
    type: String,
    required: true,
    maxlength: 2000
  },
  order: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Order'
  },
  messages: [{
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true
    },
    senderRole: {
      type: String,
      enum: ['customer', 'support', 'admin'],
      required: true
    },
    message: {
      type: String,
      required: true,
      maxlength: 2000
    },
    attachments: [{
      url: String,
      type: String,
      name: String
    }],
    isInternal: {
      type: Boolean,
      default: false
    },
    createdAt: {
      type: Date,
      default: Date.now
    }
  }],
  assignedTo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  attachments: [{
    url: String,
    type: String,
    name: String,
    uploadedAt: {
      type: Date,
      default: Date.now
    }
  }],
  tags: [String],
  resolution: {
    resolvedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    },
    resolvedAt: Date,
    resolutionNote: String,
    customerSatisfaction: {
      rating: {
        type: Number,
        min: 1,
        max: 5
      },
      feedback: String
    }
  },
  sla: {
    responseTime: Number, // en minutos
    resolutionTime: Number, // en minutos
    firstResponseAt: Date,
    breached: {
      type: Boolean,
      default: false
    }
  },
  metadata: {
    userAgent: String,
    ipAddress: String,
    platform: String
  }
}, {
  timestamps: true
});

// Índices
supportTicketSchema.index({ user: 1, createdAt: -1 });
supportTicketSchema.index({ ticketNumber: 1 }, { unique: true });
supportTicketSchema.index({ status: 1, priority: -1 });
supportTicketSchema.index({ assignedTo: 1, status: 1 });
supportTicketSchema.index({ category: 1 });
supportTicketSchema.index({ createdAt: -1 });

// Pre-save hook para generar número de ticket
supportTicketSchema.pre('save', async function(next) {
  if (this.isNew && !this.ticketNumber) {
    const count = await this.constructor.countDocuments();
    this.ticketNumber = `TKT${String(count + 1).padStart(6, '0')}`;
  }
  next();
});

// Método para agregar mensaje
supportTicketSchema.methods.addMessage = function(senderId, senderRole, message, attachments = []) {
  this.messages.push({
    sender: senderId,
    senderRole,
    message,
    attachments
  });
  
  // Primera respuesta de soporte
  if (senderRole === 'support' && !this.sla.firstResponseAt) {
    this.sla.firstResponseAt = new Date();
    const responseTime = Math.floor((this.sla.firstResponseAt - this.createdAt) / 60000);
    this.sla.responseTime = responseTime;
    
    // SLA: 15 minutos para primera respuesta
    if (responseTime > 15) {
      this.sla.breached = true;
    }
  }
};

// Método para cambiar estado
supportTicketSchema.methods.updateStatus = function(newStatus, userId) {
  this.status = newStatus;
  
  if (newStatus === 'resolved' || newStatus === 'closed') {
    if (!this.resolution.resolvedBy) {
      this.resolution.resolvedBy = userId;
      this.resolution.resolvedAt = new Date();
      
      const resolutionTime = Math.floor((this.resolution.resolvedAt - this.createdAt) / 60000);
      this.sla.resolutionTime = resolutionTime;
      
      // SLA: 24 horas para resolución
      if (resolutionTime > 1440) {
        this.sla.breached = true;
      }
    }
  }
};

// Método para asignar a soporte
supportTicketSchema.methods.assignTo = function(supportUserId) {
  this.assignedTo = supportUserId;
  this.status = 'in_progress';
};

// Virtual para unread messages
supportTicketSchema.virtual('unreadCount').get(function() {
  // Implementar lógica de mensajes no leídos
  return 0;
});

supportTicketSchema.set('toJSON', { virtuals: true });
supportTicketSchema.set('toObject', { virtuals: true });

module.exports = mongoose.model('SupportTicket', supportTicketSchema);
