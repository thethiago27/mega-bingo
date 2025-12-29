import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { AnimatedNumber } from "./animated-number";

describe("AnimatedNumber", () => {
  describe("Basic Rendering", () => {
    it("should render number with zero padding", () => {
      render(<AnimatedNumber number={5} isMarked={false} />);
      expect(screen.getByText("05")).toBeInTheDocument();
    });

    it("should render two-digit numbers without extra padding", () => {
      render(<AnimatedNumber number={42} isMarked={false} />);
      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("should render three-digit numbers correctly", () => {
      render(<AnimatedNumber number={100} isMarked={false} />);
      expect(screen.getByText("100")).toBeInTheDocument();
    });

    it("should render with default medium size", () => {
      const { container } = render(
        <AnimatedNumber number={10} isMarked={false} />,
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass("text-3xl", "p-4");
    });
  });

  describe("Size Variants", () => {
    it("should apply small size classes", () => {
      const { container } = render(
        <AnimatedNumber number={10} isMarked={false} size="sm" />,
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass("text-xl", "p-2");
    });

    it("should apply medium size classes", () => {
      const { container } = render(
        <AnimatedNumber number={10} isMarked={false} size="md" />,
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass("text-3xl", "p-4");
    });

    it("should apply large size classes", () => {
      const { container } = render(
        <AnimatedNumber number={10} isMarked={false} size="lg" />,
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass("text-4xl", "p-6");
    });
  });

  describe("Marked State Styling", () => {
    it("should apply unmarked styles when isMarked is false", () => {
      const { container } = render(
        <AnimatedNumber number={10} isMarked={false} />,
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass(
        "bg-white",
        "border-gray-200",
        "text-gray-900",
      );
    });

    it("should apply marked styles when isMarked is true", () => {
      const { container } = render(
        <AnimatedNumber number={10} isMarked={true} />,
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass(
        "bg-blue-500",
        "border-blue-500",
        "text-white",
      );
    });

    it("should include shadow effect when marked", () => {
      const { container } = render(
        <AnimatedNumber number={10} isMarked={true} />,
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass("shadow-lg", "shadow-blue-500/20");
    });
  });

  describe("Base Classes", () => {
    it("should always include base layout classes", () => {
      const { container } = render(
        <AnimatedNumber number={10} isMarked={false} />,
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass(
        "flex",
        "items-center",
        "justify-center",
        "rounded-xl",
        "border-2",
        "transition-all",
        "font-bold",
      );
    });
  });

  describe("Animation on Marking Transition", () => {
    it("should not have animation class initially when unmarked", () => {
      const { container } = render(
        <AnimatedNumber number={10} isMarked={false} />,
      );
      const element = container.firstChild as HTMLElement;
      expect(element).not.toHaveClass("animate-number-mark");
    });

    it("should not animate when already marked on initial render", () => {
      const { container } = render(
        <AnimatedNumber number={10} isMarked={true} />,
      );
      const element = container.firstChild as HTMLElement;
      // Initially marked, no animation
      expect(element).not.toHaveClass("animate-number-mark");
    });

    it("should not animate when transitioning from marked to unmarked", () => {
      const { container, rerender } = render(
        <AnimatedNumber number={10} isMarked={true} />,
      );
      const element = container.firstChild as HTMLElement;

      // Unmark the number
      rerender(<AnimatedNumber number={10} isMarked={false} />);

      // Should not have animation class
      expect(element).not.toHaveClass("animate-number-mark");
    });
  });

  describe("isNew Prop Animation", () => {
    it("should apply animation class when isNew is true", () => {
      const { container } = render(
        <AnimatedNumber number={10} isMarked={false} isNew={true} />,
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass("animate-number-mark");
    });

    it("should not apply animation class when isNew is false", () => {
      const { container } = render(
        <AnimatedNumber number={10} isMarked={false} isNew={false} />,
      );
      const element = container.firstChild as HTMLElement;
      expect(element).not.toHaveClass("animate-number-mark");
    });

    it("should apply animation when isNew is true even if marked", () => {
      const { container } = render(
        <AnimatedNumber number={10} isMarked={true} isNew={true} />,
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass("animate-number-mark");
    });

    it("should apply animation when isNew is true and unmarked", () => {
      const { container } = render(
        <AnimatedNumber number={10} isMarked={false} isNew={true} />,
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass("animate-number-mark");
    });
  });

  describe("Timer Cleanup", () => {
    it("should not throw on unmount", () => {
      const { unmount } = render(
        <AnimatedNumber number={10} isMarked={false} />,
      );

      // Should not throw
      expect(() => {
        unmount();
      }).not.toThrow();
    });

    it("should handle rapid prop changes without errors", () => {
      const { rerender } = render(
        <AnimatedNumber number={10} isMarked={false} />,
      );

      // Rapid changes should not throw
      expect(() => {
        rerender(<AnimatedNumber number={10} isMarked={true} />);
        rerender(<AnimatedNumber number={10} isMarked={false} />);
        rerender(<AnimatedNumber number={10} isMarked={true} />);
      }).not.toThrow();
    });
  });

  describe("Dark Mode Support", () => {
    it("should include dark mode classes for unmarked state", () => {
      const { container } = render(
        <AnimatedNumber number={10} isMarked={false} />,
      );
      const element = container.firstChild as HTMLElement;
      expect(element).toHaveClass(
        "dark:bg-gray-800",
        "dark:border-gray-600",
        "dark:text-white",
      );
    });

    it("should not include dark mode classes for marked state", () => {
      const { container } = render(
        <AnimatedNumber number={10} isMarked={true} />,
      );
      const element = container.firstChild as HTMLElement;
      expect(element).not.toHaveClass("dark:bg-gray-800");
    });
  });

  describe("Edge Cases", () => {
    it("should handle number 0", () => {
      render(<AnimatedNumber number={0} isMarked={false} />);
      expect(screen.getByText("00")).toBeInTheDocument();
    });

    it("should handle negative numbers", () => {
      render(<AnimatedNumber number={-5} isMarked={false} />);
      expect(screen.getByText("-5")).toBeInTheDocument();
    });

    it("should handle very large numbers", () => {
      render(<AnimatedNumber number={9999} isMarked={false} />);
      expect(screen.getByText("9999")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should render as a div element", () => {
      const { container } = render(
        <AnimatedNumber number={10} isMarked={false} />,
      );
      expect(container.firstChild?.nodeName).toBe("DIV");
    });

    it("should have sufficient contrast in marked state", () => {
      const { container } = render(
        <AnimatedNumber number={10} isMarked={true} />,
      );
      const element = container.firstChild as HTMLElement;
      // Blue background with white text provides good contrast
      expect(element).toHaveClass("bg-blue-500", "text-white");
    });

    it("should have sufficient contrast in unmarked state", () => {
      const { container } = render(
        <AnimatedNumber number={10} isMarked={false} />,
      );
      const element = container.firstChild as HTMLElement;
      // White background with dark text provides good contrast
      expect(element).toHaveClass("bg-white", "text-gray-900");
    });
  });

  describe("Performance", () => {
    it("should not re-render unnecessarily when props do not change", () => {
      const { rerender } = render(
        <AnimatedNumber number={10} isMarked={false} />,
      );

      // Re-render with same props
      rerender(<AnimatedNumber number={10} isMarked={false} />);

      // Component should handle this gracefully
      expect(screen.getByText("10")).toBeInTheDocument();
    });

    it("should handle rapid prop changes", () => {
      const { rerender } = render(
        <AnimatedNumber number={10} isMarked={false} />,
      );

      // Rapid changes
      for (let i = 0; i < 10; i++) {
        rerender(<AnimatedNumber number={i} isMarked={i % 2 === 0} />);
      }

      // Should still work correctly
      expect(screen.getByText("09")).toBeInTheDocument();
    });
  });

  describe("Component Behavior", () => {
    it("should update number display when number prop changes", () => {
      const { rerender } = render(
        <AnimatedNumber number={5} isMarked={false} />,
      );
      expect(screen.getByText("05")).toBeInTheDocument();

      rerender(<AnimatedNumber number={42} isMarked={false} />);
      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("should update styles when isMarked prop changes", () => {
      const { container, rerender } = render(
        <AnimatedNumber number={10} isMarked={false} />,
      );
      const element = container.firstChild as HTMLElement;

      expect(element).toHaveClass("bg-white");

      rerender(<AnimatedNumber number={10} isMarked={true} />);
      expect(element).toHaveClass("bg-blue-500");
    });

    it("should update size when size prop changes", () => {
      const { container, rerender } = render(
        <AnimatedNumber number={10} isMarked={false} size="sm" />,
      );
      const element = container.firstChild as HTMLElement;

      expect(element).toHaveClass("text-xl");

      rerender(<AnimatedNumber number={10} isMarked={false} size="lg" />);
      expect(element).toHaveClass("text-4xl");
    });
  });
});
