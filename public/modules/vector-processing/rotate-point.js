/**
 * Given a point, an angle in radians, and an anchor point,
 * Return the [x, y] co-ordinates of the point rotated around
 * the anchor point by the specified angle.
 *
 * @param {[number, number]} point - The point to rotate
 * @param {number} angle - The angle in radians to rotate the point
 * @param {[number, number]} anchor - The anchor point to rotate around
 * @returns {[number, number]} - The rotated point
 */
export function rotatePoint([pX, pY], angle, [aX, aY]) {
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);
	const xRotated = cos * (pX - aX) - sin * (pY - aY) + aX;
	const yRotated = sin * (pX - aX) + cos * (pY - aY) + aY;
	return [xRotated, yRotated];
}
