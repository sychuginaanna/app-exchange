import React, {ReactNode} from 'react';
import SlickSlider from 'react-slick';

import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './slick.css';
import s from './slider.module.css';

type Props = {
  children: ReactNode[];
  className?: string;
};

const sliderSettings = {
  dots: true,
  arrows: true,
  infinite: false,
  speed: 260,
  currentSlide: 0
};

export const Slider: React.FC<Props> = ({children}) => {
  return (
    <SlickSlider {...sliderSettings}>
      {children.map(
        (slide: ReactNode, index: number): React.ReactElement => (
          <div className={s.slide} key={index}>
            {slide}
          </div>
        ),
      )}
    </SlickSlider>
  );
};
