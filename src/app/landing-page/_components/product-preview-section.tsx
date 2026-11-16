import { SectionFrame } from './section-frame';
import { PreviewWindow } from './product-preview/preview-window';

export function ProductPreviewSection() {
  return (
    <SectionFrame id="product-preview" className="max-w-[1320px] pt-2">
      <PreviewWindow />
    </SectionFrame>
  );
}
