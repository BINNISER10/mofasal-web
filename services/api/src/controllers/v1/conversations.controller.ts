import { Response, NextFunction } from 'express';
import prisma from '../../config/database';
import { AuthRequest } from '../../middleware/auth';
import { sendSuccess, sendCreated } from '../../utils/response';
import { ApiError } from '../../utils/ApiError';
import socketService from '../../services/SocketService';

export class ConversationController {
  static async getByOrder(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      let conversation = await prisma.conversation.findUnique({
        where: { orderId: req.params.orderId },
        include: {
          messages: {
            orderBy: { createdAt: 'asc' },
            take: 50,
            include: { sender: { select: { id: true, name: true, avatar: true, role: true } } },
          },
        },
      });

      if (!conversation) {
        conversation = await prisma.conversation.create({
          data: { orderId: req.params.orderId },
          include: { messages: { include: { sender: { select: { id: true, name: true, avatar: true, role: true } } } } },
        }) as any;
      }

      sendSuccess(res, conversation);
    } catch (error) { next(error); }
  }

  static async sendMessage(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      let conversation = await prisma.conversation.findUnique({ where: { orderId: req.params.orderId } });
      if (!conversation) {
        conversation = await prisma.conversation.create({ data: { orderId: req.params.orderId } });
      }

      const message = await prisma.message.create({
        data: {
          conversationId: conversation.id,
          senderId: req.user!.id,
          content: req.body.content,
          type: req.body.type || 'TEXT',
          mediaUrl: req.body.mediaUrl,
        },
        include: { sender: { select: { id: true, name: true, avatar: true, role: true } } },
      });

      socketService.emitMessage(conversation.id, req.params.orderId, message);

      sendCreated(res, message, 'Message sent');
    } catch (error) { next(error); }
  }

  static async getMessages(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const conversation = await prisma.conversation.findUnique({ where: { id: req.params.id } });
      if (!conversation) throw ApiError.notFound('Conversation not found');

      const messages = await prisma.message.findMany({
        where: { conversationId: req.params.id },
        orderBy: { createdAt: 'asc' },
        take: 100,
        include: { sender: { select: { id: true, name: true, avatar: true, role: true } } },
      });

      sendSuccess(res, messages);
    } catch (error) { next(error); }
  }

  static async markAsRead(req: AuthRequest, res: Response, next: NextFunction) {
    try {
      const message = await prisma.message.findUnique({ where: { id: req.params.messageId } });
      if (!message) throw ApiError.notFound('Message not found');

      const updated = await prisma.message.update({
        where: { id: req.params.messageId },
        data: { readAt: new Date() },
      });

      sendSuccess(res, updated, 'Message marked as read');
    } catch (error) { next(error); }
  }
}
