export interface APIResults<T> {
    success: boolean;
    statusCode: number;
    timestamp: number;
    errors: ReadonlyArray<string>[],
    message: string;
    data: T
}