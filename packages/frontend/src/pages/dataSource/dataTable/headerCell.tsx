import React, { useMemo } from 'react';
import styled from 'styled-components';
import intl from 'react-intl-universal';
import DistributionMiniChart from './distributionMiniChart';
import { FieldSummary } from '../../../service';
import { DropdownSelect } from '@tableau/tableau-ui'
import { BIFieldType, FieldType } from '../../../global';
import { IFieldMeta, IRawField } from '../../../interfaces';
import { ISemanticType } from 'visual-insights/build/esm/insights/InsightFlow/interfaces';

const HeaderCellContainer = styled.div`
    .bottom-bar {
        position: absolute;
        height: 4px;
        border-radius: 0px 0px 2px 2px;
        left: 0px;
        right: 0px;
        top: 0px;
        margin: 0px 1px;
    }
    .dim {
        background-color: #1890ff;
    }
    .mea {
        background-color: #13c2c2;
    }
    .disable {
        background-color: #9e9e9e;
    }
    .header{
        margin-top: 0px;
        margin-bottom: 0px;
    }
`;

function getClassName (type: 'dimension' | 'measure', disable: boolean) {
    if (disable) return 'disable'
    return type === "dimension" ? "dim" : "mea"
}

interface HeaderCellProps {
    name: string;
    code: string;
    disable: boolean;
    onChange?: (fid: string, propKey: keyof IRawField, value: any) => void
    meta: IFieldMeta | null;
}

interface IOption<T = string> { key: T; text: string };

const DataTypeOptions: IOption<FieldType>[] = [
    { key: 'nominal', text: 'nominal' },
    { key: 'ordinal', text: 'ordinal' },
    { key: 'quantitative', text: 'quantitative' },
    { key: 'temporal', text: 'temporal' }
]

function useBIFieldTypeOptions (): IOption<BIFieldType>[] {
    const dimensionLabel = intl.get('meta.dimension');
    const measureLabel = intl.get('meta.measure');
    const options = useMemo<IOption<BIFieldType>[]>(() => {
        return [
            { key: 'dimension', text: dimensionLabel },
            { key: 'measure', text: measureLabel }
        ]
    }, [dimensionLabel, measureLabel]);
    return options;
}

const HeaderCell: React.FC<HeaderCellProps> = props => {
    const { name, code, meta, disable, onChange } = props;
    const optionsOfBIFieldType = useBIFieldTypeOptions();
    return (
        <HeaderCellContainer>
            <h3 className="header">{name}</h3>
            {meta && (
                <DropdownSelect aria-readonly kind="text" disabled={true} value={meta.semanticType} onChange={e => {
                    if (onChange) {
                        onChange(code, 'semanticType', e.target.value as ISemanticType)
                    }
                }}>
                    {DataTypeOptions.map((op) => (
                        <option key={op.key} value={op.key}>
                            {op.text}
                        </option>
                    ))}
                </DropdownSelect>
            )}
            {
                <DropdownSelect kind="text" value={meta?.analyticType} onChange={(e) => {
                    if (onChange) {
                        // FIXME: 弱约束问题
                        onChange(code, 'analyticType', e.target.value as BIFieldType);
                    }
                }}>
                    {
                        optionsOfBIFieldType.map(op => <option key={op.key} value={op.key}>{op.text}</option>)
                    }
                </DropdownSelect>
            }
            <div>
                <label>{intl.get('dataSource.useField')}</label>
                <input checked={!disable} type="checkbox" onChange={e => {
                    onChange && onChange(code, 'disable', !e.target.checked)
                }} />
            </div>
            {/* <Checkbox label="use" checked={!disable} onChange={(e, isChecked) => {
                onChange && onChange(code, 'disable', !isChecked)
            }} /> */}
            {meta && <DistributionMiniChart dataSource={meta ? meta.distribution : []} x="memberName" y="count" fieldType={meta?.semanticType || 'nominal'} />}
            <div className={`bottom-bar ${getClassName(meta?.analyticType || 'dimension', disable)}`}></div>
        </HeaderCellContainer>
    );
}

export default HeaderCell;
