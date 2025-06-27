import { FastifyInstance } from 'fastify';
import { PrismaClient } from '@prisma/client';
import { nanoid } from 'nanoid';

const prisma = new PrismaClient();

const normalizeUrl = (url: string) => {
  if (!/^(https?:\/\/)/i.test(url)) {
    return `https://${url}`;
  }
  return url;
};

export default async function (fastify: FastifyInstance) {
  fastify.post('/api/qr/new', async (request, reply) => {
    const { destination, custom_slug } = request.body as {
      destination: string;
      custom_slug?: string;
    };
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
  });

  fastify.get('/r/:slug', async (request, reply) => {
    const { slug } = request.params as { slug: string };

    try {
      const qrLink = await prisma.qrLink.findUnique({
        where: { slug },
      });

      if (qrLink) {
        // Log the analytics event (optional for now)
        // await prisma.analyticsEvent.create({ data: { qrLinkId: qrLink.id, userAgent: request.headers['user-agent'] } });

        // Redirect to the original URL
        reply.status(302).redirect(qrLink.originalUrl);
      } else {
        reply.status(404).send({ message: 'Short URL not found.' });
      }
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ message: 'Error processing request.' });
    }
  });

  // Get all links for the current user
  fastify.get('/api/qr/links', async (request, reply) => {
    const ownerId = 'clerk_user_id_placeholder'; // Placeholder
    try {
      const links = await prisma.qrLink.findMany({
        where: { ownerId },
        orderBy: { createdAt: 'desc' },
      });
      reply.send(links);
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ message: 'Error fetching links.' });
    }
  });

  // Update a link's destination
  fastify.put('/api/qr/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    const { destination } = request.body as { destination: string };
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
  });

  // Delete a link
  fastify.delete('/api/qr/:id', async (request, reply) => {
    const { id } = request.params as { id: string };
    try {
      await prisma.qrLink.delete({
        where: { id },
      });
      reply.status(204).send();
    } catch (error) {
      fastify.log.error(error);
      reply.status(500).send({ message: 'Error deleting link.' });
    }
  });
}
