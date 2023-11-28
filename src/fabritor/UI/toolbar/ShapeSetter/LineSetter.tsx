import { useContext, useEffect } from 'react';
import { Form } from 'antd';
import { GloablStateContext } from '@/context';
import { getGlobalEditor } from '@/utils/global';
import ColorSetter from '@/fabritor/components/ColorSetter';
import StrokeSetter from './StrokeSetter';

const { Item: FormItem } = Form;

export default function LineSetter () {
  const { object } = useContext(GloablStateContext);
  const [form] = Form.useForm();

  const getObjectBorderType = (stroke, strokeWidth, strokeDashArray) => {
    if (!stroke) {
      return 'none';
    }
    if (strokeDashArray?.length) {
      let [d1, d2] = strokeDashArray;
      d1 = d1 / (strokeWidth / 2 > 1 ? strokeWidth / 2 : strokeWidth);
      d2 = d2 / (strokeWidth / 2 > 1 ? strokeWidth / 2 : strokeWidth * 2);
      return [d1, d2].join(',');
    }
    return 'line';
  }

  const handleStrokeConfig = (strokeConfig) => {
    if (!strokeConfig) return;
    const { strokeWidth = 1, round = false, type = 'line' } = strokeConfig;

    object.set('strokeWidth', strokeWidth);

    object.set('strokeLineCap', round ? 'round' : 'butt');

    if (type !== 'line') {
      const dashArray = type.split(',');
      dashArray[0] = dashArray[0] * (strokeWidth / 2 > 1 ? strokeWidth / 2 : strokeWidth);
      dashArray[1] = dashArray[1] * (strokeWidth / 2 > 1 ? strokeWidth / 2 : strokeWidth * 2);
      object.set('strokeDashArray', dashArray);
    } else {
      object.set('strokeDashArray', null);
    }
  }

  const handleValuesChange = (values) => {
    const keys = Object.keys(values);
    if (!keys?.length) return;
    for (let key of keys) {
      switch (key) {
        case 'stroke':
          object.set('stroke', values[key]);
          break;
        case 'strokeConfig':
          handleStrokeConfig(values[key]);
          break;
        default:
          break;
      }
    }

    const editor = getGlobalEditor();
    editor.canvas.requestRenderAll();
  }

  useEffect(() => {
    form.setFieldsValue({
      stroke: object.stroke,
      strokeConfig: {
        type: getObjectBorderType(object.stroke, object.strokeWidth, object.strokeDashArray),
        strokeWidth: object.strokeWidth,
        round: object.strokeLineCap === 'round'
      }
    });
  }, [object]);

  return (
    <Form
      form={form}
      onValuesChange={handleValuesChange}
      layout="inline"
    >
      <FormItem
        name="stroke"
      >
        <ColorSetter />
      </FormItem>
      <FormItem
        name="strokeConfig"
      >
        <StrokeSetter />
      </FormItem>
    </Form>
  )
}