import { FindOneOptions, FindOptionsWhere, Repository } from "typeorm";

// FIX 1: Add a generic constraint "extends object"
export class BaseService<T extends object> {
  protected repo: Repository<T>;

  constructor(repo: Repository<T>) {
    this.repo = repo;
  }

  async create(payload: Partial<T>): Promise<T> {
    const entity = this.repo.create(payload as any);
    // FIX 2: Explicitly cast the result to T to satisfy the return type
    return this.repo.save(entity) as Promise<T>; 
  }

  async findAll(): Promise<T[]> {
    return this.repo.find();
  }

  async findOne(id: number | string, options?: FindOneOptions<T>): Promise<T | null> {
    if (options) {
      return this.repo.findOne({
        where: { id } as unknown as FindOptionsWhere<T>,
        ...options
      });
    }
    return this.repo.findOneBy({ id } as any);
  }

  async update(id: number | string, payload: Partial<T>): Promise<T | null> {
    const entity = await this.findOne(id);
    if (!entity) return null;
    this.repo.merge(entity, payload as any);
    return await this.repo.save(entity) as Promise<T>;
  }

  async delete(id: number | string): Promise<boolean> {
    const res = await this.repo.delete(id as any);
    // FIX 3: Check that res.affected is a positive number (handles null and undefined safely)
    return (res.affected || 0) > 0;
  }
}