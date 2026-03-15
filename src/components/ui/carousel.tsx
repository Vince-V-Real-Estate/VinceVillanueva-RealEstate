"use client";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { ArrowRight, Bed, Bath, Square, MapPin } from "lucide-react";
import { useState, useRef, useId, useEffect } from "react";

export interface SlideData {
  id?: string;
  title: string;
  src: string;
  price: string;
  address: string;
  specs: {
    beds: number;
    baths: number;
    sqft: number;
  };
  href?: string;
  button?: string;
  mlsId?: string;
}

interface SlideProps {
  slide: SlideData;
  index: number;
  current: number;
  showDetailsOverlay: boolean;
  handleSlideClick: (index: number) => void;
}

const Slide = ({
  slide,
  index,
  current,
  showDetailsOverlay,
  handleSlideClick,
}: SlideProps) => {
  const slideRef = useRef<HTMLLIElement>(null);

  const xRef = useRef(0);
  const yRef = useRef(0);
  const frameRef = useRef<number>(0);

  useEffect(() => {
    const animate = () => {
      if (!slideRef.current) return;

      const x = xRef.current;
      const y = yRef.current;

      slideRef.current.style.setProperty("--x", `${x}px`);
      slideRef.current.style.setProperty("--y", `${y}px`);

      frameRef.current = requestAnimationFrame(animate);
    };

    frameRef.current = requestAnimationFrame(animate);

    return () => {
      if (frameRef.current) {
        cancelAnimationFrame(frameRef.current);
      }
    };
  }, []);

  const handleMouseMove = (event: React.MouseEvent) => {
    const el = slideRef.current;
    if (!el) return;

    const r = el.getBoundingClientRect();
    xRef.current = event.clientX - (r.left + Math.floor(r.width / 2));
    yRef.current = event.clientY - (r.top + Math.floor(r.height / 2));
  };

  const handleMouseLeave = () => {
    xRef.current = 0;
    yRef.current = 0;
  };

  const imageLoaded = (event: React.SyntheticEvent<HTMLImageElement>) => {
    event.currentTarget.style.opacity = "1";
  };

  const { src, title, price, address, specs } = slide;

  return (
    <div className="perspective-distant transform-3d">
      <li
        ref={slideRef}
        className="group relative z-10 mx-[4vmin] flex h-[60vmin] w-[60vmin] flex-1 flex-col items-center justify-center text-center text-white opacity-100 transition-all duration-300 ease-in-out md:h-[40vmin] md:w-[40vmin]"
        onClick={() => handleSlideClick(index)}
        onMouseMove={handleMouseMove}
        onMouseLeave={handleMouseLeave}
        style={{
          transform:
            current !== index
              ? "scale(0.98) rotateX(8deg)"
              : "scale(1) rotateX(0deg)",
          transition: "transform 0.5s cubic-bezier(0.4, 0, 0.2, 1)",
          transformOrigin: "bottom",
        }}
      >
        <div
          className="absolute top-0 left-0 h-full w-full overflow-hidden rounded-2xl bg-[#1D1F2F] shadow-2xl transition-all duration-150 ease-out"
          style={{
            transform:
              current === index
                ? "translate3d(calc(var(--x) / 30), calc(var(--y) / 30), 0)"
                : "none",
          }}
        >
          <Image
            className="absolute inset-0 h-full w-full object-cover opacity-100 transition-opacity duration-600 ease-in-out"
            style={{
              opacity: current === index ? 1 : 0.5,
            }}
            alt={title}
            src={src}
            fill
            onLoad={imageLoaded}
            loading="eager"
            decoding="sync"
          />

          {/* Default Overlay (Gradient) */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-60 transition-opacity duration-300 group-hover:opacity-40" />

          {/* Hover Details Overlay */}
          <div
            className={`absolute inset-0 flex flex-col justify-end bg-black/40 p-6 backdrop-blur-[2px] transition-opacity duration-300 ${
              showDetailsOverlay
                ? "opacity-100"
                : "opacity-0 group-hover:opacity-100"
            }`}
          >
            <div className="translate-y-4 transform text-left transition-transform duration-300 group-hover:translate-y-0">
              <span className="mb-2 inline-block rounded bg-white/20 px-2 py-1 text-xs font-bold tracking-wider text-white uppercase backdrop-blur-md">
                Featured
              </span>
              <h3 className="mb-1 text-2xl font-bold text-white">{price}</h3>
              <div className="mb-3 flex items-center gap-1 text-sm text-gray-200">
                <MapPin className="h-3 w-3" />
                <span className="truncate">{address}</span>
              </div>

              <div className="flex items-center justify-between border-t border-white/20 pt-3 text-sm font-medium text-white">
                <div className="flex items-center gap-1.5">
                  <Bed className="h-4 w-4 text-white/80" />
                  <span>{specs.beds} Beds</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Bath className="h-4 w-4 text-white/80" />
                  <span>{specs.baths} Baths</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Square className="h-4 w-4 text-white/80" />
                  <span>{specs.sqft} sqft</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Title always visible if not hovered? Or maybe just hide it on hover */}
        <article
          className={`absolute top-6 left-6 text-left transition-opacity duration-300 ease-in-out ${
            current === index ? "visible opacity-100" : "invisible opacity-0"
          } ${showDetailsOverlay ? "opacity-0" : "group-hover:opacity-0"}`}
        >
          <h2 className="text-xl font-bold drop-shadow-md md:text-2xl lg:text-3xl">
            {title}
          </h2>
        </article>
      </li>
    </div>
  );
};

interface CarouselControlProps {
  type: string;
  title: string;
  handleClick: () => void;
}

const CarouselControl = ({
  type,
  title,
  handleClick,
}: CarouselControlProps) => {
  return (
    <button
      className={`mx-2 flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/50 backdrop-blur-md transition duration-200 hover:bg-white hover:text-black focus:outline-none ${
        type === "previous" ? "rotate-180" : ""
      }`}
      title={title}
      onClick={handleClick}
    >
      <ArrowRight className="h-5 w-5" />
    </button>
  );
};

interface CarouselProps {
  slides: SlideData[];
}

export default function Carousel({ slides }: CarouselProps) {
  const router = useRouter();
  const [current, setCurrent] = useState(0);
  const [isTouchInput, setIsTouchInput] = useState(false);
  const [mobileDetailsIndex, setMobileDetailsIndex] = useState<number | null>(
    null,
  );

  useEffect(() => {
    const media = window.matchMedia("(hover: none), (pointer: coarse)");

    const updateTouchInput = () => {
      setIsTouchInput(media.matches);
    };

    updateTouchInput();
    media.addEventListener("change", updateTouchInput);

    return () => {
      media.removeEventListener("change", updateTouchInput);
    };
  }, []);

  useEffect(() => {
    if (slides.length === 0) {
      setCurrent(0);
      setMobileDetailsIndex(null);
      return;
    }

    if (current >= slides.length) {
      setCurrent(0);
    }
  }, [current, slides.length]);

  useEffect(() => {
    if (!isTouchInput) {
      setMobileDetailsIndex(null);
    }
  }, [isTouchInput]);

  if (slides.length === 0) {
    return null;
  }

  const handlePreviousClick = () => {
    setMobileDetailsIndex(null);
    const previous = current - 1;
    setCurrent(previous < 0 ? slides.length - 1 : previous);
  };

  const handleNextClick = () => {
    setMobileDetailsIndex(null);
    const next = current + 1;
    setCurrent(next === slides.length ? 0 : next);
  };

  const handleSlideClick = (index: number) => {
    const selectedSlide = slides[index];
    if (!selectedSlide) {
      return;
    }

    if (isTouchInput) {
      if (current !== index) {
        setCurrent(index);
        setMobileDetailsIndex(index);
        return;
      }

      if (mobileDetailsIndex !== index) {
        setMobileDetailsIndex(index);
        return;
      }

      if (selectedSlide.href) {
        router.push(selectedSlide.href);
      }
      return;
    }

    if (current !== index) {
      setCurrent(index);
      return;
    }

    if (selectedSlide.href) {
      router.push(selectedSlide.href);
    }
  };

  const id = useId();

  return (
    <div
      className="relative mx-auto h-[60vmin] w-[60vmin] overflow-visible md:h-[40vmin] md:w-[40vmin]" // Overflow visible to allow tilt effect to not be clipped? Actually overflow-hidden is usually needed for the track.
      aria-labelledby={`carousel-heading-${id}`}
    >
      <div className="absolute inset-0 overflow-hidden">
        <ul
          className="absolute mx-[-4vmin] flex transition-transform duration-1000 ease-in-out"
          style={{
            transform: `translateX(-${current * (100 / slides.length)}%)`,
          }}
        >
          {slides.map((slide, index) => (
            <Slide
              key={slide.id ?? index}
              slide={slide}
              index={index}
              current={current}
              showDetailsOverlay={
                isTouchInput &&
                current === index &&
                mobileDetailsIndex === index
              }
              handleSlideClick={handleSlideClick}
            />
          ))}
        </ul>
      </div>

      <div className="absolute -bottom-16 z-20 flex w-full justify-center">
        <CarouselControl
          type="previous"
          title="Go to previous slide"
          handleClick={handlePreviousClick}
        />

        <CarouselControl
          type="next"
          title="Go to next slide"
          handleClick={handleNextClick}
        />
      </div>
    </div>
  );
}
