import type { FC } from "react";

interface SplitProps {
  type?: 'vertical' | 'horizontal';
}
 
const Split: FC<SplitProps> = ({ type = 'horizontal' }) => {
  return (
    <div className={`${type === 'horizontal' ? 'w-full h-[1px]' : 'w-[1px] h-full'} bg-border`}></div>
  );
}
 
export default Split;