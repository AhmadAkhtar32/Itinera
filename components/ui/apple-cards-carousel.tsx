"use client";
import React, { useEffect, useRef, useState, createContext, useContext } from "react";
import { IconArrowNarrowLeft, IconArrowNarrowRight, IconX } from "@tabler/icons-react";
import { cn } from "@/lib/utils";
import { AnimatePresence, motion } from "motion/react";
import Image from "next/image";
import { useOutsideClick } from "@/hooks/use-outside-click";

interface CarouselProps {
  items: JSX.Element[];
  initialScroll?: number;
}

type CardType = {
  src: string;
  title: string;
  category: string;
  content: React.ReactNode;
};

export const CarouselContext = createContext<{
  onCardClose: (index: number) => void;
  currentIndex: number;
}>({
  onCardClose: () => { },
  currentIndex: 0,
});

export const Carousel = ({ items, initialScroll = 0 }: CarouselProps) => {
  const carouselRef = React.useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = React.useState(false);
  const [canScrollRight, setCanScrollRight] = React.useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (carouselRef.current) {
      carouselRef.current.scrollLeft = initialScroll;
      checkScrollability();
    }

    const onResize = () => checkScrollability();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [initialScroll]);

  const checkScrollability = () => {
    if (carouselRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = carouselRef.current;
      setCanScrollLeft(scrollLeft > 0);
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 1);
    }
  };

  const scrollLeft = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: -300, behavior: "smooth" });
    }
  };

  const scrollRight = () => {
    if (carouselRef.current) {
      carouselRef.current.scrollBy({ left: 300, behavior: "smooth" });
    }
  };

  const handleCardClose = (index: number) => {
    if (carouselRef.current) {
      const cardWidth = isMobile() ? 230 : 384; // (md:w-96)
      const gap = isMobile() ? 4 : 16;
      const scrollPosition = (cardWidth + gap) * (index + 1);
      carouselRef.current.scrollTo({ left: scrollPosition, behavior: "smooth" });
      setCurrentIndex(index);
    }
  };

  const isMobile = () => {
    if (typeof window === "undefined") return false;
    return window.innerWidth < 768;
  };

  return (
    <CarouselContext.Provider value={{ onCardClose: handleCardClose, currentIndex }}>
      <div className="relative w-full">
        <div
          className="flex w-full overflow-x-scroll overscroll-x-auto scroll-smooth py-10 [scrollbar-width:none] md:py-20"
          ref={carouselRef}
          onScroll={checkScrollability}
        >
          <div className={cn("absolute right-0 z-[1000] h-auto w-[5%] overflow-hidden bg-gradient-to-l")} />

          <div className={cn("flex flex-row justify-start gap-4 pl-4", "mx-auto max-w-7xl")}>
            {items.map((item, index) => (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.15 * index, ease: "easeOut" }}
                key={"card" + index}
                className="rounded-3xl last:pr-[5%] md:last:pr-[33%]"
              >
                {item}
              </motion.div>
            ))}
          </div>
        </div>

        <div className="mr-10 flex justify-end gap-2">
          <button
            className="relative z-40 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 disabled:opacity-50"
            onClick={scrollLeft}
            disabled={!canScrollLeft}
            aria-label="Scroll left"
          >
            <IconArrowNarrowLeft className="h-6 w-6 text-gray-500" />
          </button>
          <button
            className="relative z-40 flex h-10 w-10 items-center justify-center rounded-full bg-gray-100 disabled:opacity-50"
            onClick={scrollRight}
            disabled={!canScrollRight}
            aria-label="Scroll right"
          >
            <IconArrowNarrowRight className="h-6 w-6 text-gray-500" />
          </button>
        </div>
      </div>
    </CarouselContext.Provider>
  );
};

export const Card = ({ card, index, layout = false }: { card: CardType; index: number; layout?: boolean }) => {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { onCardClose } = useContext(CarouselContext);

  useEffect(() => {
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") handleClose();
    }

    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "auto";

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open]);

  useOutsideClick(containerRef, () => handleClose());

  const handleOpen = () => setOpen(true);
  const handleClose = () => {
    setOpen(false);
    onCardClose(index);
  };

  return (
    <>
      <AnimatePresence>
        {open && (
          <div className="fixed inset-0 z-50 h-screen overflow-auto">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 h-full w-full bg-black/80 backdrop-blur-lg"
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: 20 }}
              ref={containerRef}
              layoutId={layout ? `card-${card.title}` : undefined}
              className="relative z-[60] mx-auto my-10 h-fit max-w-5xl rounded-3xl bg-white p-4 font-sans md:p-10 dark:bg-neutral-900"
            >
              <button
                className="sticky top-4 right-0 ml-auto flex h-8 w-8 items-center justify-center rounded-full bg-black dark:bg-white"
                onClick={handleClose}
                aria-label="Close"
              >
                <IconX className="h-6 w-6 text-neutral-100 dark:text-neutral-900" />
              </button>

              <motion.p layoutId={layout ? `category-${card.title}` : undefined} className="text-base font-medium text-black dark:text-white">
                {card.category}
              </motion.p>

              <motion.p layoutId={layout ? `title-${card.title}` : undefined} className="mt-4 text-2xl font-semibold text-neutral-700 md:text-5xl dark:text-white">
                {card.title}
              </motion.p>

              <div className="py-10">{card.content}</div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <motion.button
        layoutId={layout ? `card-${card.title}` : undefined}
        onClick={handleOpen}
        className="relative z-10 flex h-80 w-56 flex-col items-start justify-start overflow-hidden rounded-3xl bg-gray-100 md:h-[40rem] md:w-96 dark:bg-neutral-900"
      >
        <div className="pointer-events-none absolute inset-x-0 top-0 z-30 h-full bg-gradient-to-b from-black/50 via-transparent to-transparent" />

        <div className="relative z-40 p-8">
          <motion.p layoutId={layout ? `category-${card.category}` : undefined} className="text-left font-sans text-sm font-medium text-white md:text-base">
            {card.category}
          </motion.p>

          <motion.p layoutId={layout ? `title-${card.title}` : undefined} className="mt-2 max-w-xs text-left font-sans text-xl font-semibold [text-wrap:balance] text-white md:text-3xl">
            {card.title}
          </motion.p>
        </div>

        {/* image container for next/image fill */}
        <div className="absolute inset-0 z-10">
          <NextBlurImage src={card.src} alt={card.title} fill />
        </div>
      </motion.button>
    </>
  );
};

// --- NextBlurImage (inline) ---

const isExternalUrl = (url?: string) => {
  if (!url) return false;
  try {
    const u = new URL(url);
    return u.protocol.startsWith("http");
  } catch {
    return false;
  }
};

type NextBlurImageProps = {
  src: string;
  alt?: string;
  className?: string;
  width?: number;
  height?: number;
  fill?: boolean;
  blurDataURL?: string | undefined;
};

export const NextBlurImage: React.FC<NextBlurImageProps> = ({ src, alt, className, width = 600, height = 400, fill = false, blurDataURL }) => {
  const [loaded, setLoaded] = useState(false);

  // External image -> fallback to native img with CSS blur
  if (isExternalUrl(src)) {
    return (
      <div className={cn(fill ? "relative w-full h-full" : "w-full", className)}>
        <img
          src={src}
          alt={alt ?? "image"}
          onLoad={() => setLoaded(true)}
          onError={() => setLoaded(true)}
          className={cn(
            "object-cover w-full h-full transition duration-300",
            loaded ? "blur-0 scale-100" : "blur-sm scale-[1.02]"
          )}
          style={fill ? { objectFit: "cover", width: "100%", height: "100%" } : undefined}
        />
      </div>
    );
  }

  // Local asset -> use next/image optimizations
  if (fill) {
    return (
      <div className={cn("relative w-full h-full", className)}>
        <Image
          src={src}
          alt={alt ?? "image"}
          fill
          className="object-cover"
          placeholder={blurDataURL ? "blur" : "empty"}
          blurDataURL={blurDataURL}
        />
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt ?? "image"}
      width={width}
      height={height}
      className={cn("object-cover w-full h-auto", className)}
      placeholder={blurDataURL ? "blur" : "empty"}
      blurDataURL={blurDataURL}
    />
  );
};

export default Carousel;
