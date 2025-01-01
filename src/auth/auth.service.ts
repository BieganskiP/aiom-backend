import {
  Injectable,
  ConflictException,
  BadRequestException,
  NotFoundException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { UsersService } from '../users/users.service';
import { CreateUserDto } from '../users/dto/create-user.dto';
import { EmailService } from '../email/email.service';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { CompleteRegistrationDto } from './dto/complete-registration.dto';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
    private emailService: EmailService,
  ) {}

  async signup(createUserDto: CreateUserDto) {
    // Check if user exists
    const existingUser = await this.usersService.findByEmail(
      createUserDto.email,
    );
    if (existingUser) {
      throw new ConflictException('Email already exists');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(createUserDto.password, 10);

    // Create new user
    const user = await this.usersService.create({
      ...createUserDto,
      password: hashedPassword,
    });

    // Generate JWT token
    const payload = { sub: user.id, email: user.email };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
      },
    };
  }

  async validateUser(email: string, password: string) {
    const user = await this.usersService.findByEmail(email);
    if (user && (await bcrypt.compare(password, user.password))) {
      // Update last login time
      await this.usersService.updateLastLogin(user.id);
      return user;
    }
    return null;
  }

  async createInvitation(email: string) {
    // Check if user already exists
    const existingUser = await this.usersService.findByEmail(email);
    if (existingUser) {
      throw new BadRequestException('User with this email already exists');
    }

    // Generate invitation token
    const token = crypto.randomBytes(32).toString('hex');
    const expiresIn = new Date();
    expiresIn.setHours(expiresIn.getHours() + 24); // Token expires in 24 hours

    // Store invitation token (you might want to create a separate table for this)
    await this.usersService.storeInvitationToken(email, token, expiresIn);

    // Send invitation email
    await this.emailService.sendInvitationEmail(email, token);

    return { message: 'Invitation sent successfully' };
  }

  async validateInvitationToken(token: string) {
    const invitation = await this.usersService.findInvitationByToken(token);
    if (!invitation || invitation.expiresAt < new Date()) {
      throw new BadRequestException('Invalid or expired invitation token');
    }
    return invitation;
  }

  async requestPasswordReset(email: string) {
    const user = await this.usersService.findByEmail(email);
    if (!user) {
      // For security reasons, don't reveal that the user doesn't exist
      return {
        message:
          'If a user with this email exists, they will receive a password reset email.',
      };
    }

    const token = crypto.randomBytes(32).toString('hex');
    const expiresIn = new Date();
    expiresIn.setHours(expiresIn.getHours() + 1); // Token expires in 1 hour

    user.passwordResetToken = token;
    user.passwordResetExpires = expiresIn;
    await this.usersService.update(user.id, {
      passwordResetToken: token,
      passwordResetExpires: expiresIn,
    });

    await this.emailService.sendPasswordResetEmail(user, token);

    return {
      message:
        'If a user with this email exists, they will receive a password reset email.',
    };
  }

  async resetPassword(token: string, newPassword: string) {
    const user = await this.usersService.findByPasswordResetToken(token);
    if (!user || user.passwordResetExpires < new Date()) {
      throw new BadRequestException('Invalid or expired password reset token');
    }

    const hashedPassword = await bcrypt.hash(newPassword, 10);
    await this.usersService.update(user.id, {
      password: hashedPassword,
      passwordResetToken: null,
      passwordResetExpires: null,
    });

    return { message: 'Password has been reset successfully' };
  }

  async completeRegistration(completeRegistrationDto: CompleteRegistrationDto) {
    const invitation = await this.usersService.findInvitationByToken(
      completeRegistrationDto.token,
    );

    if (!invitation) {
      throw new BadRequestException('Invalid or expired invitation token');
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(
      completeRegistrationDto.password,
      10,
    );

    // Update the user with the complete information
    const user = await this.usersService.findByEmail(invitation.email);
    if (!user) {
      throw new NotFoundException('User not found');
    }

    // Remove token from the DTO and add the hashed password
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { token, ...updateData } = completeRegistrationDto;
    const updatedUser = await this.usersService.update(user.id, {
      ...updateData,
      password: hashedPassword,
      invitationToken: null,
      invitationExpires: null,
    });

    // Update last login time since this is their first login
    await this.usersService.updateLastLogin(updatedUser.id);

    // Generate JWT token
    const payload = { sub: updatedUser.id, email: updatedUser.email };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
        id: updatedUser.id,
        email: updatedUser.email,
        firstName: updatedUser.firstName,
        lastName: updatedUser.lastName,
        role: updatedUser.role,
        active: updatedUser.active,
      },
    };
  }
}
