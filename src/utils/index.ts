/**
 * Helper methods and extensions
 */

Array.prototype.getRandomItem = function <T>(this: T[]): T {
  return this[Math.floor(Math.random() * this.length)];
}
