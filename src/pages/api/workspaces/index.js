import { InvitationStatus } from '@prisma/client';

import { validateSession } from '@/config/api-validation';
import prisma from '@/prisma/index';

const handler = async (req, res) => {
  const { method } = req;

  if (method === 'GET') {
    await validateSession(req, res);
    const workspaces = await prisma.workspace.findMany({
      select: {
        createdAt: true,
        creator: {
          select: {
            email: true,
            name: true,
          },
        },
        inviteCode: true,
        members: {
          select: {
            member: {
              select: {
                email: true,
                image: true,
                name: true,
              },
            },
            joinedAt: true,
            status: true,
            teamRole: true,
          },
        },
        name: true,
        slug: true,
        workspaceCode: true,
      },
      where: {
        OR: [
          { id: session.user.userId },
          {
            members: {
              some: {
                email: session.user.email,
                deletedAt: null,
                status: InvitationStatus.ACCEPTED,
              },
            },
          },
        ],
        AND: { deletedAt: null },
      },
    });
    res.status(200).json({ data: { workspaces } });
  } else {
    res.status(405).json({ error: `${method} method unsupported` });
  }
};

export default handler;
