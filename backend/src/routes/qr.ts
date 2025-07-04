import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';
import {
  createQrLinkSchema,
  idParamSchema,
  slugParamSchema,
  updateQrLinkSchema,
} from '../schemas/qr';
import { ZodError } from 'zod';

// Create Prisma client inside the function to respect environment variables
let prisma: PrismaClient;

const normalizeUrl = (url: string) => {
  if (!/^(https?:\/\/)/i.test(url)) {
    return `https://${url}`;
  }
  return url;
};

export default async function (fastify: FastifyInstance) {
  // Initialize Prisma client here to respect current environment variables
  if (!prisma) {
    prisma = new PrismaClient();
  }

  // Error handler for zod validation
  fastify.setErrorHandler((error, request, reply) => {
    if (error instanceof ZodError) {
      reply.status(400).send({
        statusCode: 400,
        error: 'Bad Request',
        message: error.errors
          .map((e) => `${e.path.join('.')}: ${e.message}`)
          .join(', '),
      });
      return;
    }
    reply.send(error);
  });

  fastify.post('/api/qr/new', async (request, reply) => {
    try {
      const { destination, custom_slug } = createQrLinkSchema.parse(
        request.body
      );
      const slug = custom_slug || nanoid(7);
      const normalizedDestination = normalizeUrl(destination);

      // For now, we'll use a placeholder for the ownerId
      const ownerId = 'clerk_user_id_placeholder';

      try {
        // Ensure the placeholder user exists before creating the link
        await prisma.user.upsert({
          where: { id: ownerId },
          update: {},
          create: {
            id: ownerId,
            email: 'placeholder@example.com', // Email is a required field
          },
        });

        const newQrLink = await prisma.qrLink.create({
          data: {
            originalUrl: normalizedDestination,
            slug,
            ownerId,
          },
        });
        reply.send(newQrLink);
      } catch (error: any) {
        // Handle potential error if the slug is not unique
        if (error.code === 'P2002') {
          reply.status(409).send({ message: 'Custom slug already exists.' });
        } else {
          fastify.log.error(error);
          reply.status(500).send({ message: 'Error creating QR code.' });
        }
      }
    } catch (error) {
      if (error instanceof ZodError) {
        reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: error.errors
            .map((e) => `${e.path.join('.')}: ${e.message}`)
            .join(', '),
        });
      } else {
        fastify.log.error(error);
        reply.status(500).send({ message: 'Error processing request.' });
      }
    }
  });

  fastify.get('/r/:slug', async (request, reply) => {
    try {
      const { slug } = slugParamSchema.parse(request.params);

      try {
        fastify.log.info(`Handling redirect for slug: ${slug}`);
        const qrLink = await prisma.qrLink.findUnique({
          where: { slug },
        });

        if (qrLink) {
          // Log the analytics event
          await prisma.analyticsEvent.create({
            data: {
              qrLinkId: qrLink.id,
              userAgent: request.headers['user-agent'],
              ipAddress: request.ip,
            },
          });

          // Set CORS headers explicitly for this route
          reply.header('Access-Control-Allow-Origin', '*');
          reply.header('Access-Control-Allow-Methods', 'GET');

          // Log the redirect destination
          fastify.log.info(`Redirecting to: ${qrLink.originalUrl}`);

          // Redirect to the original URL
          reply.status(302).redirect(qrLink.originalUrl);
        } else {
          fastify.log.warn(`Slug not found: ${slug}`);
          reply.status(404).send({ message: 'Short URL not found.' });
        }
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({ message: 'Error processing request.' });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: error.errors
            .map((e) => `${e.path.join('.')}: ${e.message}`)
            .join(', '),
        });
      } else {
        fastify.log.error(error);
        reply.status(500).send({ message: 'Error processing request.' });
      }
    }
  });

  // Get all links for the current user
  fastify.get('/api/qr/links', async (request, reply) => {
    const ownerId = 'clerk_user_id_placeholder'; // Placeholder
    try {
      const links = await prisma.qrLink.findMany({
        where: { ownerId },
        orderBy: { createdAt: 'desc' },
        include: {
          _count: {
            select: { analyticsEvents: true },
          },
          analyticsEvents: {
            orderBy: { timestamp: 'desc' },
            take: 1,
          },
        },
      });
      reply.send(links);
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ message: 'Error fetching links.' });
    }
  });

  // Get analytics for a specific link
  fastify.get('/api/qr/:id/analytics', async (request, reply) => {
    try {
      const { id } = idParamSchema.parse(request.params);
      try {
        const analytics = await prisma.analyticsEvent.findMany({
          where: { qrLinkId: id },
          orderBy: { timestamp: 'desc' },
          take: 100, // Limit to last 100 events
        });

        // Get count of total scans
        const totalScans = await prisma.analyticsEvent.count({
          where: { qrLinkId: id },
        });

        reply.send({ events: analytics, totalScans });
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({ message: 'Error fetching analytics.' });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: error.errors
            .map((e) => `${e.path.join('.')}: ${e.message}`)
            .join(', '),
        });
      } else {
        fastify.log.error(error);
        reply.status(500).send({ message: 'Error processing request.' });
      }
    }
  });

  // Update a link's destination
  fastify.put('/api/qr/:id', async (request, reply) => {
    try {
      const { id } = idParamSchema.parse(request.params);
      const { destination } = updateQrLinkSchema.parse(request.body);
      const normalizedDestination = normalizeUrl(destination);

      try {
        const updatedLink = await prisma.qrLink.update({
          where: { id },
          data: { originalUrl: normalizedDestination },
        });
        reply.send(updatedLink);
      } catch (error) {
        fastify.log.error(error);
        reply.status(500).send({ message: 'Error updating link.' });
      }
    } catch (error) {
      if (error instanceof ZodError) {
        reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: error.errors
            .map((e) => `${e.path.join('.')}: ${e.message}`)
            .join(', '),
        });
      } else {
        fastify.log.error(error);
        reply.status(500).send({ message: 'Error processing request.' });
      }
    }
  });

  // Delete a link
  fastify.delete('/api/qr/:id', async (request, reply) => {
    try {
      const { id } = idParamSchema.parse(request.params);
      fastify.log.info(`Attempting to delete QR link with ID: ${id}`);

      try {
        // Check if the link exists first
        const existingLink = await prisma.qrLink.findUnique({
          where: { id },
        });

        if (!existingLink) {
          fastify.log.warn(`QR link not found for deletion: ${id}`);
          reply.status(404).send({ message: 'QR link not found.' });
          return;
        }

        // Delete associated analytics events first
        await prisma.analyticsEvent.deleteMany({
          where: { qrLinkId: id },
        });

        // Then delete the QR link
        await prisma.qrLink.delete({
          where: { id },
        });

        fastify.log.info(`Successfully deleted QR link: ${id}`);
        reply.status(204).send();
      } catch (error: any) {
        fastify.log.error(`Error deleting QR link ${id}:`, error);

        if (error.code === 'P2025') {
          // Record not found
          reply.status(404).send({ message: 'QR link not found.' });
        } else {
          reply.status(500).send({ message: 'Error deleting link.' });
        }
      }
    } catch (error) {
      if (error instanceof ZodError) {
        reply.status(400).send({
          statusCode: 400,
          error: 'Bad Request',
          message: error.errors
            .map((e) => `${e.path.join('.')}: ${e.message}`)
            .join(', '),
        });
      } else {
        fastify.log.error(error);
        reply.status(500).send({ message: 'Error processing request.' });
      }
    }
  });
}
