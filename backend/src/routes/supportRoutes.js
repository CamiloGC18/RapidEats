const express = require('express');
const router = express.Router();
const supportController = require('../controllers/supportController');
const { authenticate, authorize } = require('../middlewares/auth');

// ===== RUTAS PÚBLICAS (con autenticación) =====

router.use(authenticate);

// Tickets
router.post('/tickets', supportController.createTicket);
router.get('/tickets', supportController.getUserTickets);
router.get('/tickets/:ticketId', supportController.getTicketById);
router.post('/tickets/:ticketId/messages', supportController.addMessage);
router.patch('/tickets/:ticketId/status', supportController.updateTicketStatus);
router.post('/tickets/:ticketId/rate', supportController.rateResolution);

// FAQs
router.get('/faqs', supportController.getFAQs);
router.post('/faqs/:faqId/view', supportController.incrementFAQViews);
router.post('/faqs/:faqId/rate', supportController.rateFAQ);

// ===== RUTAS ADMIN =====

// Tickets Admin
router.get('/admin/tickets', authorize('admin'), supportController.getAllTickets);
router.post('/admin/tickets/:ticketId/assign', authorize('admin'), supportController.assignTicket);

// FAQs Admin
router.post('/admin/faqs', authorize('admin'), supportController.createFAQ);
router.put('/admin/faqs/:faqId', authorize('admin'), supportController.updateFAQ);
router.delete('/admin/faqs/:faqId', authorize('admin'), supportController.deleteFAQ);

module.exports = router;
