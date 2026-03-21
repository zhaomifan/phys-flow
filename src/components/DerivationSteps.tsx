import React from 'react';
import type { DerivationStep as DerivationStepType } from '../utils/derivationEngine';
import { physicsQuantities } from '../data/physicsData';

interface DerivationStepsProps {
  steps: DerivationStepType[];
  success: boolean;
  knownQuantities: string[];
  targetQuantities: string[];
}

const DerivationSteps: React.FC<DerivationStepsProps> = ({
  steps,
  success,
  knownQuantities,
  targetQuantities
}) => {
  const getQuantitySymbol = (id: string) => {
    const q = physicsQuantities.find(q => q.id === id);
    return q ? q.symbol : id;
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

  if (steps.length === 0) {
    return (
      <div className="steps-placeholder">
        <div className="placeholder-icon">❌</div>
        <p>未找到推导路径</p>
        <p className="hint">请尝试选择更多的已知物理量</p>
      </div>
    );
  }

  return (
    <div className="derivation-steps">
      <div className="steps-header">
        <h3>推导步骤</h3>
        <div className={`status-badge ${success ? 'success' : 'partial'}`}>
          {success ? '✓ 推导成功' : '部分推导'}
        </div>
      </div>

      <div className="known-quantities">
        <span className="label">已知：</span>
        {knownQuantities.map(id => (
          <span key={id} className="quantity-tag known">
            {getQuantitySymbol(id)}
          </span>
        ))}
      </div>

      <div className="steps-list">
        {steps.map((step, index) => (
          <div key={step.formula.id} className="step-item" style={{ animationDelay: `${index * 0.15}s` }}>
            <div className="step-number">{index + 1}</div>
            <div className="step-content">
              <div className="formula-name">{step.formula.name}</div>
              <div className="formula-latex">{step.formula.latex}</div>
              <div className="formula-info">
                <div className="inputs">
                  <span className="info-label">输入：</span>
                  {step.formula.inputs.map(input => (
                    <span key={input} className="info-tag">
                      {getQuantitySymbol(input)}
                    </span>
                  ))}
                </div>
                <div className="arrow">→</div>
                <div className="outputs">
                  <span className="info-label">输出：</span>
                  {step.newlyDerived.map(output => (
                    <span key={output} className="info-tag new">
                      {getQuantitySymbol(output)}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="derived-quantities">
        <span className="label">可推导：</span>
        {targetQuantities.map(id => (
          <span key={id} className="quantity-tag target">
            {getQuantitySymbol(id)}
          </span>
        ))}
      </div>
    </div>
  );
};

export default DerivationSteps;
