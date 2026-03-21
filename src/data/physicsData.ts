export interface PhysicsQuantity {
  id: string;
  name: string;
  symbol: string;
  unit: string;
  category: 'kinematics' | 'dynamics' | 'energy' | 'electricity' | 'optics' | 'thermodynamics';
}

export interface Formula {
  id: string;
  name: string;
  latex: string;
  inputs: string[];
  outputs: string[];
  category: string;
}

export const physicsQuantities: PhysicsQuantity[] = [
  // 运动学
  { id: 'displacement', name: '位移', symbol: 's', unit: 'm', category: 'kinematics' },
  { id: 'initial_velocity', name: '初速度', symbol: 'v₀', unit: 'm/s', category: 'kinematics' },
  { id: 'velocity', name: '速度', symbol: 'v', unit: 'm/s', category: 'kinematics' },
  { id: 'acceleration', name: '加速度', symbol: 'a', unit: 'm/s²', category: 'kinematics' },
  { id: 'time', name: '时间', symbol: 't', unit: 's', category: 'kinematics' },
  // 动力学
  { id: 'mass', name: '质量', symbol: 'm', unit: 'kg', category: 'dynamics' },
  { id: 'force', name: '力', symbol: 'F', unit: 'N', category: 'dynamics' },
  { id: 'friction_coefficient', name: '摩擦系数', symbol: 'μ', unit: '', category: 'dynamics' },
  // 能量
  { id: 'kinetic_energy', name: '动能', symbol: 'Eₖ', unit: 'J', category: 'energy' },
  { id: 'potential_energy', name: '势能', symbol: 'Eₚ', unit: 'J', category: 'energy' },
  { id: 'work', name: '功', symbol: 'W', unit: 'J', category: 'energy' },
  { id: 'power', name: '功率', symbol: 'P', unit: 'W', category: 'energy' },
  { id: 'height', name: '高度', symbol: 'h', unit: 'm', category: 'energy' },
  { id: 'momentum', name: '动量', symbol: 'p', unit: 'kg·m/s', category: 'energy' },
  // 电学
  { id: 'voltage', name: '电压', symbol: 'U', unit: 'V', category: 'electricity' },
  { id: 'current', name: '电流', symbol: 'I', unit: 'A', category: 'electricity' },
  { id: 'resistance', name: '电阻', symbol: 'R', unit: 'Ω', category: 'electricity' },
  { id: 'charge', name: '电荷量', symbol: 'Q', unit: 'C', category: 'electricity' },
  { id: 'electric_energy', name: '电能', symbol: 'E', unit: 'J', category: 'electricity' },
  // 热学
  { id: 'temperature', name: '温度', symbol: 'T', unit: 'K', category: 'thermodynamics' },
  { id: 'heat', name: '热量', symbol: 'Q', unit: 'J', category: 'thermodynamics' },
  { id: 'specific_heat', name: '比热容', symbol: 'c', unit: 'J/(kg·K)', category: 'thermodynamics' },
  { id: 'temperature_change', name: '温度变化', symbol: 'ΔT', unit: 'K', category: 'thermodynamics' },
];

export const formulas: Formula[] = [
  // 运动学公式
  {
    id: 'kinematic_1',
    name: '匀变速直线运动位移公式',
    latex: 's = v₀t + ½at²',
    inputs: ['initial_velocity', 'time', 'acceleration'],
    outputs: ['displacement'],
    category: '运动学'
  },
  {
    id: 'kinematic_2',
    name: '速度-时间关系',
    latex: 'v = v₀ + at',
    inputs: ['initial_velocity', 'acceleration', 'time'],
    outputs: ['velocity'],
    category: '运动学'
  },
  {
    id: 'kinematic_3',
    name: '速度-位移关系',
    latex: 'v² - v₀² = 2as',
    inputs: ['velocity', 'initial_velocity', 'acceleration'],
    outputs: ['displacement'],
    category: '运动学'
  },
  {
    id: 'kinematic_4',
    name: '平均速度公式',
    latex: 's = ½(v₀ + v)t',
    inputs: ['initial_velocity', 'velocity', 'time'],
    outputs: ['displacement'],
    category: '运动学'
  },
  // 动力学公式
  {
    id: 'newton_second',
    name: '牛顿第二定律',
    latex: 'F = ma',
    inputs: ['mass', 'acceleration'],
    outputs: ['force'],
    category: '动力学'
  },
  {
    id: 'friction_force',
    name: '摩擦力公式',
    latex: 'f = μN = μmg',
    inputs: ['friction_coefficient', 'mass'],
    outputs: ['force'],
    category: '动力学'
  },
  // 能量公式
  {
    id: 'kinetic_energy',
    name: '动能公式',
    latex: 'Eₖ = ½mv²',
    inputs: ['mass', 'velocity'],
    outputs: ['kinetic_energy'],
    category: '能量'
  },
  {
    id: 'potential_energy',
    name: '重力势能公式',
    latex: 'Eₚ = mgh',
    inputs: ['mass', 'height'],
    outputs: ['potential_energy'],
    category: '能量'
  },
  {
    id: 'work',
    name: '功的公式',
    latex: 'W = Fs',
    inputs: ['force', 'displacement'],
    outputs: ['work'],
    category: '能量'
  },
  {
    id: 'power',
    name: '功率公式',
    latex: 'P = W/t',
    inputs: ['work', 'time'],
    outputs: ['power'],
    category: '能量'
  },
  {
    id: 'momentum',
    name: '动量公式',
    latex: 'p = mv',
    inputs: ['mass', 'velocity'],
    outputs: ['momentum'],
    category: '能量'
  },
  {
    id: 'work_energy',
    name: '动能定理',
    latex: 'W = ½mv² - ½mv₀²',
    inputs: ['mass', 'velocity', 'initial_velocity'],
    outputs: ['work'],
    category: '能量'
  },
  // 电学公式
  {
    id: 'ohm_law',
    name: '欧姆定律',
    latex: 'U = IR',
    inputs: ['current', 'resistance'],
    outputs: ['voltage'],
    category: '电学'
  },
  {
    id: 'electric_power',
    name: '电功率公式',
    latex: 'P = UI',
    inputs: ['voltage', 'current'],
    outputs: ['power'],
    category: '电学'
  },
  {
    id: 'joule_law',
    name: '焦耳定律',
    latex: 'Q = I²Rt',
    inputs: ['current', 'resistance', 'time'],
    outputs: ['heat'],
    category: '电学'
  },
  {
    id: 'electric_energy',
    name: '电能公式',
    latex: 'E = UIt',
    inputs: ['voltage', 'current', 'time'],
    outputs: ['electric_energy'],
    category: '电学'
  },
  {
    id: 'charge_current',
    name: '电流定义式',
    latex: 'Q = It',
    inputs: ['current', 'time'],
    outputs: ['charge'],
    category: '电学'
  },
  // 热学公式
  {
    id: 'heat_capacity',
    name: '热量计算公式',
    latex: 'Q = cmΔT',
    inputs: ['specific_heat', 'mass', 'temperature_change'],
    outputs: ['heat'],
    category: '热学'
  },
];

export const categoryColors: Record<string, string> = {
  '运动学': '#4CAF50',
  '动力学': '#2196F3',
  '能量': '#FF9800',
  '电学': '#9C27B0',
  '热学': '#F44336'
};

export const quantityCategoryNames: Record<string, string> = {
  'kinematics': '运动学',
  'dynamics': '动力学',
  'energy': '能量',
  'electricity': '电学',
  'thermodynamics': '热学',
  'optics': '光学'
};
