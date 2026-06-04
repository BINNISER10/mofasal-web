import swaggerJsdoc from 'swagger-jsdoc';
import { config } from './index';

const swaggerDefinition = {
  openapi: '3.0.0',
  info: {
    title: 'MUFASAL ERP API',
    version: '1.0.0',
    description: 'مُنصة مُفصّل للخياطة الرجالية وملابس الأطفال - واجهة برمجة التطبيقات',
    contact: {
      name: 'MUFASAL Support',
      email: 'support@mufasal.com',
    },
  },
  servers: [
    { url: `http://localhost:${config.port}${config.apiPrefix}`, description: 'Development' },
    { url: 'https://api.mufasal.com/api/v1', description: 'Production' },
  ],
  components: {
    securitySchemes: {
      bearerAuth: {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
      },
    },
    schemas: {
      ApiResponse: {
        type: 'object',
        properties: {
          success: { type: 'boolean' },
          message: { type: 'string' },
          data: { type: 'object' },
          error: { type: 'object', properties: { message: { type: 'string' }, details: { type: 'object' } } },
        },
      },
      PaginatedResponse: {
        type: 'object',
        properties: {
          items: { type: 'array' },
          total: { type: 'integer' },
          page: { type: 'integer' },
          limit: { type: 'integer' },
        },
      },
      Employee: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string' },
          position: { type: 'string' },
          salary: { type: 'number' },
          departmentId: { type: 'string' },
          shopId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Department: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          description: { type: 'string' },
          managerId: { type: 'string' },
          shopId: { type: 'string' },
        },
      },
      PurchaseOrder: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          supplierId: { type: 'string' },
          status: { type: 'string', enum: ['DRAFT', 'PENDING', 'APPROVED', 'SHIPPED', 'DELIVERED', 'CANCELLED'] },
          totalAmount: { type: 'number' },
          taxAmount: { type: 'number' },
          shopId: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
      Supplier: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          name: { type: 'string' },
          contactPerson: { type: 'string' },
          email: { type: 'string' },
          phone: { type: 'string' },
          commercialReg: { type: 'string' },
          taxNumber: { type: 'string' },
          shopId: { type: 'string' },
        },
      },
      POSSession: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          cashierId: { type: 'string' },
          openingBalance: { type: 'number' },
          closingBalance: { type: 'number' },
          status: { type: 'string', enum: ['OPEN', 'CLOSED'] },
          shopId: { type: 'string' },
          openedAt: { type: 'string', format: 'date-time' },
          closedAt: { type: 'string', format: 'date-time' },
        },
      },
      POSOrder: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          sessionId: { type: 'string' },
          totalAmount: { type: 'number' },
          paymentMethod: { type: 'string' },
          status: { type: 'string' },
          createdAt: { type: 'string', format: 'date-time' },
        },
      },
    },
  },
  paths: {},
};

const options = {
  swaggerDefinition,
  apis: ['./src/routes/v1/*.ts', './src/controllers/v1/*.ts'],
};

export const swaggerSpec = swaggerJsdoc(options);
