import { css } from '@maverick/tokens';

export const TestBox = () => {
  return (
    <div
      className={css({
        px: '3',
        py: '2',
        bg: 'primary',
        color: 'white',
        borderRadius: 'md',
        borderColor: 'primaryAccent', 
      })}
    >
      Test Padding
    </div>
  );
};