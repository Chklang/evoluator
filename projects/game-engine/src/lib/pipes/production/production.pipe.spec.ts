import { ProductionPipe } from './production.pipe';

describe('ProductionPipe', () => {
  it('create an instance', () => {
    const pipe = new ProductionPipe();
    expect(pipe).toBeTruthy();
  });
});
