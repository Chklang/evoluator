import { SerializeGameContextPipe } from './serialize-game-context.pipe';

describe('SerializeGameContextPipe', () => {
  it('create an instance', () => {
    const pipe = new SerializeGameContextPipe();
    expect(pipe).toBeTruthy();
  });
});
