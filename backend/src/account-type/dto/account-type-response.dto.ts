export class AccountTypeResponseDto {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
  updatedAt: Date;

  constructor(model: any) {
    this.id = model.id;
    this.name = model.name;
    this.description = model.description;
    this.createdAt = model.createdAt;
    this.updatedAt = model.updatedAt;
  }
}