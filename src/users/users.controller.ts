import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  UseGuards,
  HttpCode,
  HttpStatus,
  Request,
  UnauthorizedException,
} from '@nestjs/common';
import { UsersService } from './users.service';
import { UpdateUserDto } from './dto/update-user.dto';
import { ToggleActiveDto } from './dto/toggle-active.dto';
import { JwtAuthGuard } from '../auth/jwt-auth.guard';
import { RolesGuard } from '../auth/roles.guard';
import { Roles } from '../auth/roles.decorator';
import { UserRole } from './entities/user.entity';
import { UpdateProfileDto } from './dto/update-profile.dto';
import { ChangePasswordDto } from './dto/change-password.dto';
import { UpdatePaidPerStopDto } from './dto/update-paid-per-stop.dto';
import * as bcrypt from 'bcrypt';

@UseGuards(JwtAuthGuard, RolesGuard)
@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  findAll() {
    return this.usersService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.usersService.findOne(id);
  }

  // Personal profile update - limited fields
  @Patch('profile')
  async updateProfile(
    @Request() req,
    @Body() updateProfileDto: UpdateProfileDto,
  ) {
    return this.usersService.update(req.user.id, updateProfileDto);
  }

  // Admin update - full access
  @Patch(':id')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  updateUser(@Param('id') id: string, @Body() updateUserDto: UpdateUserDto) {
    return this.usersService.update(id, updateUserDto);
  }

  @Delete(':id')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  remove(@Param('id') id: string) {
    return this.usersService.remove(id);
  }

  @Post('make-admin')
  @Roles(UserRole.ADMIN)
  @HttpCode(HttpStatus.OK)
  async makeAdmin(@Body() { email }: { email: string }) {
    return this.usersService.makeAdmin(email);
  }

  @Post(':id/toggle-active')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  async toggleActive(
    @Param('id') id: string,
    @Body() toggleActiveDto: ToggleActiveDto,
  ) {
    return this.usersService.toggleActive(id, toggleActiveDto.active);
  }

  @Post('change-password')
  @HttpCode(HttpStatus.OK)
  async changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto,
  ) {
    const user = await this.usersService.findOne(req.user.id);

    // Verify current password
    const isPasswordValid = await bcrypt.compare(
      changePasswordDto.currentPassword,
      user.password,
    );

    if (!isPasswordValid) {
      throw new UnauthorizedException('Current password is incorrect');
    }

    // Hash new password
    const hashedPassword = await bcrypt.hash(changePasswordDto.newPassword, 10);

    // Update password
    await this.usersService.update(user.id, { password: hashedPassword });

    return { message: 'Password updated successfully' };
  }

  @Patch(':id/paid-per-stop')
  @Roles(UserRole.ADMIN, UserRole.OWNER)
  updatePaidPerStop(
    @Param('id') id: string,
    @Body() updatePaidPerStopDto: UpdatePaidPerStopDto,
  ) {
    return this.usersService.updatePaidPerStop(
      id,
      updatePaidPerStopDto.paidPerStop,
    );
  }
}
