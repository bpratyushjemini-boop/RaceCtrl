/* eslint-disable @typescript-eslint/no-explicit-any */
export interface BaseProvider {
  name: string;
  fetch(key: string, ...args: any[]): Promise<any>;
  normalize(key: string, data: any, context?: any): any;
  validate(key: string, data: any): boolean;
}
