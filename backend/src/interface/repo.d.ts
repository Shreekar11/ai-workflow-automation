export interface IRepository<T> {
    get(id: string): Promise<T | null>;
    create(data: Omit<T, "id">): Promise<T>;
    patch(id: string, data: Partial<Omit<T, 'id'>>): Promise<T | null>;
    delete(id: string) : Promise<T | null>;
}