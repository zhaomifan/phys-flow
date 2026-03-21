import React from 'react';
import type { DerivationStep as DerivationStepType } from '../utils/derivationEngine';
import { physicsQuantities } from '../data/physicsData';

interface DerivationStepsProps {
  steps: DerivationStepType[];
  success: boolean;
  knownQuantities: string[];
  targetQuantities: string[];
  reason?: string;
}

const DerivationSteps: React.FC<DerivationStepsProps> = ({
  steps,
  success,
  knownQuantities,
  targetQuantities,
  reason
}) => {
  const getSymbol = (id: string) => {
    const q = physicsQuantities.find(q => q.id === id);
    return q ? q.symbol : id;
  };

  const getName = (id: string) => {
    const q = physicsQuantities.find(q => q.id === id);
    return q ? q.name : id;
  };

  if (knownQuantities.length === 0) {
    return (
      <div className="steps-placeholder">
        <div className="placeholder-icon">📝</div>
        <p>请先选择已知物理量</p>
      </div>
    );
  }

  if (targetQuantities.length === 0) {
    return (
      <div className="steps-placeholder">
        <div className="placeholder-icon">🎯</div>
        <p>请选择要推导的物理量</p>
      </div>
    );
  }

  if (steps.length === 0 && !success) {
    return (
      <div className="steps-placeholder">
        <div className="placeholder-icon">❌</div>
        <p>未找到推导路径</p>
        <p className="hint">{reason || '请尝试选择更多的已知物理量'}</p>
      </div>
    );
  }

  return (
    <div className="derivation-steps">
      <div className="steps-header">
        <h3>推导步骤 ({steps.length} 步)</h3>
        <div className={`status-badge ${success ? 'success' : 'partial'}`}>
          {success ? '✓ 推导成功' : '部分推导'}
        </div>
      </div>

      <div className="known-quantities">
        <span className="label">已知：</span>
        {knownQuantities.map(id => (
          <span key={id} className="quantity-tag known" title={getName(id)}>
            {getSymbol(id)}
          </span>
        ))}
      </div>

      <div className="steps-list">
        {steps.map((step, index) => (
          <div
            key={`${step.formula.id}-${step.derived}-${index}`}
            className="step-item"
            style={{ animationDelay: `${index * 0.1}s` }}
          >
            <div className="step-number">{index + 1}</div>
            <div className="step-content">
              <div className="formula-name">{step.formula.name}</div>
              <div className="formula-latex">{step.formula.latex}</div>
              <div className="formula-info">
                <div className="inputs">
                  <span className="info-label">已知：</span>
                  {step.knownInputs.map(input => (
                    <span key={input} className="info-tag" title={getName(input)}>
                      {getSymbol(input)}
                    </span>
                  ))}
                </div>
                <div className="arrow">⇒</div>
                <div className="outputs">
                  <span className="info-label">求得：</span>
                  <span className="info-tag new" title={getName(step.derived)}>
                    {getSymbol(step.derived)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="derived-quantities">
        <span className="label">目标：</span>
        {targetQuantities.map(id => {
          const isReached = steps.some(s => s.derived === id) || knownQuantities.includes(id);
          return (
            <span
              key={id}
              className={`quantity-tag ${isReached ? 'target reached' : 'target'}`}
              title={getName(id)}
            >
              {getSymbol(id)} {isReached ? '✓' : '?'}
            </span>
          );
        })}
      </div>
    </div>
  );
};

export default DerivationSteps;
