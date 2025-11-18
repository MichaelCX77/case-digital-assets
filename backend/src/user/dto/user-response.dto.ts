export class UserResponseDto {
  id: string;
  name: string;
  email: string;
  role: { id: string; name: string } | null; // permite null!
  createdAt: Date;
  updatedAt: Date;

  constructor(user: any) {
    this.id = user.id;
    this.name = user.name;
    this.email = user.email;
    this.role = user.role ? { id: user.role.id, name: user.role.name } : null;
    this.createdAt = user.createdAt;
    this.updatedAt = user.updatedAt;
  }
}