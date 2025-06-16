import * as Icon from '@ant-design/icons';
import BaseText from '../Text/baseText';
import styles from './index.less';

function FMButton(props: any) {
  const { id, data, style, interaction, theme = 'light' } = props || {};
  const { link } = interaction || {};

  // 正确的数据路径：从data.style中获取各种样式属性
  const { icon, text, background, radius, shadow, variant = 'default' } = data?.style || {};

  // @ts-ignore
  const MyIcon: React.ForwardRefExoticComponent<Pick<AntdIconProps, AntdIconType> &
  React.RefAttributes<HTMLSpanElement>> = icon && icon.type ? (Icon as any)[icon.type] : null;

  const handleClick = () => {
    const isPreview = location.search.includes('preview');
    if (isPreview && link) {
      window.open(link, '_blank');
    }
  }

  // 根据variant确定样式类名
  const getVariantClass = (variant: string) => {
    switch (variant) {
      case 'success': return 'success';
      case 'warning': return 'warning';
      case 'danger': return 'danger';
      default: return '';
    }
  };

  const variantClass = getVariantClass(variant);
  const themeClass = theme === 'dark' ? 'dark-theme' : '';
  const className = `${styles.fmButton} ${variantClass} ${themeClass}`.trim();

  // 安全处理radius属性
  const getBorderRadius = () => {
    if (!radius) return undefined;
    if (typeof radius === 'number') return `${radius}px`;
    if (Array.isArray(radius) && radius.length >= 4) {
      return `${radius[0]}px ${radius[1]}px ${radius[2]}px ${radius[3]}px`;
    }
    return undefined;
  };

  // 安全处理shadow属性
  const getBoxShadow = () => {
    if (!shadow || !shadow.transform || !Array.isArray(shadow.transform) || shadow.transform.length < 4) {
      return undefined;
    }
    const direction = shadow.direction === 'out' ? '' : shadow.direction;
    return `${direction} ${shadow.transform[0]}px ${shadow.transform[1]}px ${shadow.transform[2]}px ${shadow.transform[3]}px ${shadow.color || 'rgba(0,0,0,0.1)'}`;
  };

  // 构建内联样式
  const inlineStyles: any = {
    width: '100%',
    height: '100%',
    minWidth: 'auto',
    minHeight: 'auto'
  };

  // 应用背景样式 - 优先使用自定义背景，否则让CSS样式生效
  if (background) {
    // 如果有自定义背景，使用自定义背景覆盖CSS样式
    inlineStyles.background = background;
  }
  // 如果没有自定义背景，让CSS中的渐变色样式生效（不设置内联样式）

  const borderRadius = getBorderRadius();
  if (borderRadius) {
    inlineStyles.borderRadius = borderRadius;
  }

  const boxShadow = getBoxShadow();
  if (boxShadow) {
    inlineStyles.boxShadow = boxShadow;
  }

  return (
      <div
        className={className}
        style={inlineStyles}
        onClick={handleClick}
      >
          {MyIcon && (
            <div className="icon">
              <MyIcon style={{color: icon?.color, fontSize: icon?.size}} />
            </div>
          )}
          <div className="text">
            <BaseText text={text} />
          </div>
      </div>
  );
}

export default FMButton