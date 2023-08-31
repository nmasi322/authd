interface ColourFunc {
  (str: string | number): string;
}
interface FrameworkVariant {
  name: string;
  display: string;
  color: ColourFunc;
  customCommand?: string;
}
interface Framework {
  name: string;
  display: string;
  color: ColourFunc;
  variants?: FrameworkVariant[];
}
