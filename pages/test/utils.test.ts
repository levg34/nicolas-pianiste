import { describe, expect, it } from 'vitest'
import { prepareForDisplay } from '../src/utils'

describe('test prepareForDisplay function', () => {
    it('should prepare correctly for pair number', () => {
        const input = [1, 2, 3, 4, 5, 6, 7, 8]
        expect(prepareForDisplay(input)).toEqual([
            [1, 2],
            [3, 4],
            [5, 6],
            [7, 8]
        ])
    })
    it('should prepare correctly for impair number', () => {
        const input = [1, 2, 3, 4, 5, 6, 7]
        expect(prepareForDisplay(input)).toEqual([
            [1, 2],
            [3, 4],
            [5, 6],
            [7, null]
        ])
    })
})
