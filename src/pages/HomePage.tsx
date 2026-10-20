import Carousel from '../components/Carousel/Carousel';

const SLIDES = [
  { src: '/images/starsky.jpg', alt: 'Starry night sky' },
  { src: '/images/travel.jpg', alt: 'Travel scenery' },
  { src: '/images/night.jpg', alt: 'City at night' },
  { src: '/images/sea.jpg', alt: 'The sea' },
  { src: '/images/blackout.jpg', alt: 'Blackout' },
];

export default function HomePage() {
  return (
    <main>
      <Carousel slides={SLIDES} />
    </main>
  );
}
