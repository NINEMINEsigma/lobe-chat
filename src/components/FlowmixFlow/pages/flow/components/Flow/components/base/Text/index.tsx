import BaseText from "./baseText";
import './index.less';

function FMText(props: any) {
    const { id, style, theme = 'light' } = props || {};
    const { text, shadow, variant = 'default' } = style || {};

    // 根据variant确定样式类名
    const getVariantClass = (variant: string) => {
      switch (variant) {
        case 'title': return 'title';
        case 'subtitle': return 'subtitle';
        case 'description': return 'description';
        case 'emphasis': return 'emphasis';
        case 'warning': return 'warning';
        case 'success': return 'success';
        case 'error': return 'error';
        default: return '';
      }
    };

    const variantClass = getVariantClass(variant);
    const themeClass = theme === 'dark' ? 'dark-theme' : '';
    const className = `fmText ${variantClass} ${themeClass}`.trim();

    return (
      <div
        className={className}
        style={{
          textShadow: shadow ? `${shadow.direction === 'out' ? '' : shadow.direction} ${shadow.transform[0]}px ${shadow.transform[1]}px ${shadow.transform[2]}px ${shadow.color}` : 'none',
        }}
      >
        <div className="text-content">
          <BaseText text={text} />
        </div>
    </div>
    );
  }

export default FMText