export interface IStorageMigration {
  name: string;
  version: number;
  up(storage: any): Promise<void>;
  down(storage: any): Promise<void>;
}
