import { describe, it, expect, beforeEach } from 'vitest'
import { saveDraft, loadDraft, clearDraft } from '../../src/lib/storage'
describe('storage draft', () => {
  beforeEach(() => clearDraft())
  it('save and load', () => {
    saveDraft({ email: 'zhilin.zhang@v2power.io', token: 'V2PTEST1234' })
    expect(loadDraft<any>()?.email).toBe('zhilin.zhang@v2power.io')
  })
  it('clear', () => {
    saveDraft({ a: 1 }); clearDraft(); expect(loadDraft()).toBeNull()
  })
})
