export {};

declare global {
  interface Array<T> {
    getRandomItem(): T;
  }
}