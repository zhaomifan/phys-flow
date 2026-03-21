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
  quantities: string[];  // 公式涉及的所有物理量，可互相推导
  category: string;
}

export const physicsQuantities: PhysicsQuantity[] = [
  // 运动学
  { id: 'displacement', name: '位移', symbol: 's', unit: 'm', category: 'kinematics' },
  { id: 'initial_velocity', name: '初速度', symbol: 'v₀', unit: 'm/s', category: 'kinematics' },
  { id: 'velocity', name: '末速度', symbol: 'v', unit: 'm/s', category: 'kinematics' },
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

// 公式只定义涉及的物理量，任一未知量可由其余已知量推导
export const formulas: Formula[] = [
  // 运动学公式
  {
    id: 'kinematic_1',
    name: '匀变速位移公式',
    latex: 's = v₀t + ½at²',
    quantities: ['displacement', 'initial_velocity', 'time', 'acceleration'],
    category: '运动学'
  },
  {
    id: 'kinematic_2',
    name: '速度公式',
    latex: 'v = v₀ + at',
    quantities: ['velocity', 'initial_velocity', 'acceleration', 'time'],
    category: '运动学'
  },
  {
    id: 'kinematic_3',
    name: '速度位移公式',
    latex: 'v² - v₀² = 2as',
    quantities: ['velocity', 'initial_velocity', 'acceleration', 'displacement'],
    category: '运动学'
  },
  {
    id: 'kinematic_4',
    name: '平均速度公式',
    latex: 's = ½(v₀ + v)t',
    quantities: ['displacement', 'initial_velocity', 'velocity', 'time'],
    category: '运动学'
  },
  // 动力学
  {
    id: 'newton_second',
    name: '牛顿第二定律',
    latex: 'F = ma',
    quantities: ['force', 'mass', 'acceleration'],
    category: '动力学'
  },
  {
    id: 'friction',
    name: '摩擦力',
    latex: 'f = μmg',
    quantities: ['force', 'friction_coefficient', 'mass'],
    category: '动力学'
  },
  // 能量
  {
    id: 'kinetic_energy',
    name: '动能',
    latex: 'Eₖ = ½mv²',
    quantities: ['kinetic_energy', 'mass', 'velocity'],
    category: '能量'
  },
  {
    id: 'potential_energy',
    name: '重力势能',
    latex: 'Eₚ = mgh',
    quantities: ['potential_energy', 'mass', 'height'],
    category: '能量'
  },
  {
    id: 'work',
    name: '功',
    latex: 'W = Fs',
    quantities: ['work', 'force', 'displacement'],
    category: '能量'
  },
  {
    id: 'power',
    name: '功率',
    latex: 'P = W/t',
    quantities: ['power', 'work', 'time'],
    category: '能量'
  },
  {
    id: 'momentum',
    name: '动量',
    latex: 'p = mv',
    quantities: ['momentum', 'mass', 'velocity'],
    category: '能量'
  },
  {
    id: 'work_energy',
    name: '动能定理',
    latex: 'W = ½mv² - ½mv₀²',
    quantities: ['work', 'mass', 'velocity', 'initial_velocity'],
    category: '能量'
  },
  {
    id: 'energy_conservation',
    name: '机械能守恒',
    latex: '½mv² + mgh = ½mv₀² + mgh₀',
    quantities: ['velocity', 'height', 'initial_velocity', 'mass'],
    category: '能量'
  },
  // 电学
  {
    id: 'ohm',
    name: '欧姆定律',
    latex: 'U = IR',
    quantities: ['voltage', 'current', 'resistance'],
    category: '电学'
  },
  {
    id: 'electric_power',
    name: '电功率',
    latex: 'P = UI',
    quantities: ['power', 'voltage', 'current'],
    category: '电学'
  },
  {
    id: 'joule',
    name: '焦耳定律',
    latex: 'Q = I²Rt',
    quantities: ['heat', 'current', 'resistance', 'time'],
    category: '电学'
  },
  {
    id: 'electric_energy',
    name: '电能',
    latex: 'E = UIt',
    quantities: ['electric_energy', 'voltage', 'current', 'time'],
    category: '电学'
  },
  {
    id: 'charge',
    name: '电荷量',
    latex: 'Q = It',
    quantities: ['charge', 'current', 'time'],
    category: '电学'
  },
  // 热学
  {
    id: 'heat',
    name: '热量公式',
    latex: 'Q = cmΔT',
    quantities: ['heat', 'specific_heat', 'mass', 'temperature_change'],
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
