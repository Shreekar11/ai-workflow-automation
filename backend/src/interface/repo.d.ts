export interface BaseModel {
    id: string;
    [key: string]: any;
}

export interface IRepository<T extends BaseModel> {
    get(id: string): Promise<T | null>;
    create(data: Omit<T, "id">): Promise<T>;
    patch(id: string, data: Partial<Omit<T, 'id'>>): Promise<T | null>;
    delete(id: string) : Promise<T | null>;
}