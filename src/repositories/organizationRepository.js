import prisma from '../config/prisma.js';
import { NotFoundError } from '../utils/errors.js';

export class OrganizationRepository {
  static async createOrganization(data) {
    return prisma.organization.create({
      data,
    });
  }

  static async findOrganizationById(id) {
    const org = await prisma.organization.findUnique({
      where: { id },
    });

    if (!org) {
      throw new NotFoundError('Organization not found');
    }

    return org;
  }

  static async findOrganizationByName(name) {
    return prisma.organization.findFirst({
      where: { name },
    });
  }

  static async updateOrganization(id, data) {
    return prisma.organization.update({
      where: { id },
      data,
    });
  }

  static async getOrganizationUsers(id) {
    return prisma.user.findMany({
      where: { organizationId: id },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        createdAt: true,
      },
    });
  }
}
