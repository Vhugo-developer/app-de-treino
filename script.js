/* =========================================================
   1. MOTOR DE ANIMAÇÃO 3D SOMBREADA EM CANVAS (BONECO REALISTA)
   Desenha membros volumétricos com iluminação, sombra no solo
   e articulações suaves em 60fps.
   ========================================================= */
function draw3DCapsule(ctx, x1, y1, x2, y2, r1, r2, baseColor, highlightColor) {
  const dx = x2 - x1;
  const dy = y2 - y1;
  const angle = Math.atan2(dy, dx);
  const nx = -Math.sin(angle);
  const ny = Math.cos(angle);

  ctx.save();
  // Corpo principal volumétrico
  const grad = ctx.createLinearGradient(
    x1 + nx * r1, y1 + ny * r1,
    x1 - nx * r1, y1 - ny * r1
  );
  grad.addColorStop(0, highlightColor);
  grad.addColorStop(0.55, baseColor);
  grad.addColorStop(1, "#090d16");

  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x1, y1, r1, angle + Math.PI / 2, angle - Math.PI / 2);
  ctx.arc(x2, y2, r2, angle - Math.PI / 2, angle + Math.PI / 2);
  ctx.closePath();
  ctx.fill();

  // Reflexo especular (efeito 3D muscular)
  ctx.strokeStyle = "rgba(255,255,255,0.28)";
  ctx.lineWidth = Math.max(1.5, r1 * 0.22);
  ctx.lineCap = "round";
  ctx.beginPath();
  ctx.moveTo(x1 + nx * r1 * 0.35, y1 + ny * r1 * 0.35);
  ctx.lineTo(x2 + nx * r2 * 0.35, y2 + ny * r2 * 0.35);
  ctx.stroke();
  ctx.restore();
}

function draw3DSphere(ctx, x, y, r, baseColor, highlightColor) {
  ctx.save();
  const grad = ctx.createRadialGradient(x - r * 0.3, y - r * 0.35, r * 0.1, x, y, r);
  grad.addColorStop(0, highlightColor);
  grad.addColorStop(0.65, baseColor);
  grad.addColorStop(1, "#090d16");
  ctx.fillStyle = grad;
  ctx.beginPath();
  ctx.arc(x, y, r, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();
}

function render3DFrame(canvas, animType, t, accentHex) {
  const ctx = canvas.getContext("2d");
  const w = canvas.width;
  const h = canvas.height;
  ctx.clearRect(0, 0, w, h);

  // Escala proporcional ao tamanho do canvas
  const s = Math.min(w, h) / 220;
  ctx.save();
  ctx.scale(s, s);

  const skin = "#e2e8f0";
  const skinHi = "#ffffff";
  const shirt = accentHex || "#10b981";
  const shirtHi = "#a7f3d0";
  const shorts = "#334155";
  const shortsHi = "#64748b";

  // Piso com grade perspectiva 3D
  ctx.strokeStyle = "rgba(148, 163, 184, 0.14)";
  ctx.lineWidth = 1;
  ctx.beginPath();
  ctx.moveTo(15, 188);
  ctx.lineTo(205, 188);
  ctx.moveTo(30, 198);
  ctx.lineTo(190, 198);
  ctx.stroke();

  // Sombra projetada no chão
  ctx.fillStyle = "rgba(0, 0, 0, 0.45)";
  ctx.beginPath();
  ctx.ellipse(110, 190, 52, 7, 0, 0, Math.PI * 2);
  ctx.fill();

  const wave = (Math.sin(t * 3.2) + 1) / 2; // 0..1 suave

  if (animType === "crunch" || animType === "legraise") {
    // Colchonete
    draw3DCapsule(ctx, 25, 184, 195, 184, 4, 4, "#1e293b", "#475569");
    const hip = { x: 112, y: 174 };
    const torsoAngle = animType === "crunch" ? -0.15 - wave * 0.65 : -0.1;
    const shoulder = {
      x: hip.x - Math.cos(torsoAngle) * 44,
      y: hip.y + Math.sin(torsoAngle) * 44
    };
    const head = {
      x: shoulder.x - Math.cos(torsoAngle + 0.2) * 18,
      y: shoulder.y + Math.sin(torsoAngle + 0.2) * 18
    };

    // Pernas (elevando no legraise, flexionadas no crunch)
    const legAngle = animType === "legraise" ? -0.15 - wave * 1.1 : -0.75;
    const knee = {
      x: hip.x + Math.cos(legAngle) * 34,
      y: hip.y + Math.sin(legAngle) * 34
    };
    const foot = animType === "legraise"
      ? { x: knee.x + Math.cos(legAngle) * 34, y: knee.y + Math.sin(legAngle) * 34 }
      : { x: knee.x + 22, y: 178 };

    draw3DCapsule(ctx, hip.x, hip.y, knee.x, knee.y, 10, 8, shorts, shortsHi);
    draw3DCapsule(ctx, knee.x, knee.y, foot.x, foot.y, 7, 5, skin, skinHi);
    draw3DCapsule(ctx, hip.x, hip.y, shoulder.x, shoulder.y, 12, 13, shirt, shirtHi);
    draw3DSphere(ctx, head.x, head.y, 11, skin, skinHi);
    // Braços atrás da cabeça ou estendidos
    draw3DCapsule(ctx, shoulder.x, shoulder.y, head.x + 8, head.y - 10, 5, 4, skin, skinHi);

  } else if (animType === "plank" || animType === "mountain") {
    // Prancha / Escalador / Prancha com Toque
    const foot = { x: 178, y: 176 };
    const hip = { x: 122, y: 142 - (animType === "plank" ? wave * 6 : 0) };
    const shoulder = { x: 66, y: 128 };
    const head = { x: 46, y: 120 };

    // Perna de apoio
    draw3DCapsule(ctx, hip.x, hip.y, foot.x, foot.y, 9, 5, shorts, shortsHi);
    // Perna dinâmica (escalador)
    if (animType === "mountain") {
      const kneeX = 148 - wave * 56;
      const kneeY = 160 - wave * 14;
      draw3DCapsule(ctx, hip.x, hip.y, kneeX, kneeY, 9, 7, shorts, shortsHi);
      draw3DCapsule(ctx, kneeX, kneeY, kneeX + 20, kneeY + 14, 6, 5, skin, skinHi);
    }
    draw3DCapsule(ctx, hip.x, hip.y, shoulder.x, shoulder.y, 11, 13, shirt, shirtHi);
    draw3DSphere(ctx, head.x, head.y, 11, skin, skinHi);

    // Braço de apoio
    draw3DCapsule(ctx, shoulder.x, shoulder.y, 64, 180, 6, 5, skin, skinHi);
    // Braço tocando ombro (se plank)
    if (animType === "plank") {
      const handX = 64 - wave * 8;
      const handY = 180 - wave * 52;
      draw3DCapsule(ctx, shoulder.x, shoulder.y, handX, handY, 6, 5, skin, skinHi);
    }

  } else if (animType === "dip" || animType === "pushup") {
    // Banco atrás no dip
    if (animType === "dip") {
      draw3DCapsule(ctx, 30, 128, 30, 184, 14, 14, "#1e293b", "#475569");
    }
    const drop = wave * 24;
    const shoulder = animType === "dip" ? { x: 74, y: 92 + drop } : { x: 72, y: 124 + drop };
    const hip = animType === "dip" ? { x: 102, y: 132 + drop } : { x: 128, y: 144 + drop * 0.6 };
    const foot = animType === "dip" ? { x: 168, y: 178 } : { x: 182, y: 178 };
    const head = { x: shoulder.x - 14, y: shoulder.y - 18 };

    draw3DCapsule(ctx, hip.x, hip.y, foot.x, foot.y, 10, 6, shorts, shortsHi);
    draw3DCapsule(ctx, hip.x, hip.y, shoulder.x, shoulder.y, 12, 14, shirt, shirtHi);
    draw3DSphere(ctx, head.x, head.y, 11, skin, skinHi);

    const hand = animType === "dip" ? { x: 42, y: 122 } : { x: 68, y: 180 };
    const elbow = {
      x: (shoulder.x + hand.x) / 2 - 10,
      y: (shoulder.y + hand.y) / 2
    };
    draw3DCapsule(ctx, shoulder.x, shoulder.y, elbow.x, elbow.y, 6, 5, skin, skinHi);
    draw3DCapsule(ctx, elbow.x, elbow.y, hand.x, hand.y, 5, 4, skin, skinHi);

  } else if (animType === "bridge") {
    // Elevação pélvica (ângulo aberto seguro para o joelho)
    draw3DCapsule(ctx, 22, 184, 198, 184, 4, 4, "#1e293b", "#475569");
    const shoulder = { x: 58, y: 174 };
    const head = { x: 38, y: 174 };
    const hip = { x: 104, y: 174 - wave * 34 };
    const knee = { x: 146, y: 144 };
    const foot = { x: 176, y: 178 };

    draw3DCapsule(ctx, knee.x, knee.y, foot.x, foot.y, 7, 5, skin, skinHi);
    draw3DCapsule(ctx, hip.x, hip.y, knee.x, knee.y, 11, 8, shorts, shortsHi);
    draw3DCapsule(ctx, shoulder.x, shoulder.y, hip.x, hip.y, 13, 11, shirt, shirtHi);
    draw3DSphere(ctx, head.x, head.y, 11, skin, skinHi);

  } else {
    // Em pé: Elevação de Ombros / HIIT / Polichinelo / Sumô
    const jump = animType === "hiit" ? wave * 12 : 0;
    const squat = animType === "sumo" ? wave * 24 : 0;
    const hip = { x: 110, y: 114 - jump + squat };
    const shoulder = { x: 110, y: 68 - jump + squat };
    const head = { x: 110, y: 46 - jump + squat };

    const spread = animType === "hiit" ? 12 + wave * 22 : (animType === "sumo" ? 26 : 14);
    const kneeL = { x: 110 - spread * 1.15, y: 148 - jump + squat * 0.5 };
    const kneeR = { x: 110 + spread * 1.15, y: 148 - jump + squat * 0.5 };
    const footL = { x: 110 - spread, y: 180 - jump };
    const footR = { x: 110 + spread, y: 180 - jump };

    draw3DCapsule(ctx, hip.x - 6, hip.y, kneeL.x, kneeL.y, 9, 7, shorts, shortsHi);
    draw3DCapsule(ctx, kneeL.x, kneeL.y, footL.x, footL.y, 7, 5, skin, skinHi);
    draw3DCapsule(ctx, hip.x + 6, hip.y, kneeR.x, kneeR.y, 9, 7, shorts, shortsHi);
    draw3DCapsule(ctx, kneeR.x, kneeR.y, footR.x, footR.y, 7, 5, skin, skinHi);

    draw3DCapsule(ctx, hip.x, hip.y, shoulder.x, shoulder.y, 13, 16, shirt, shirtHi);
    draw3DSphere(ctx, head.x, head.y, 12, skin, skinHi);

    // Braços elevando lateralmente (ombros / HIIT)
    const armAngle = (animType === "shoulder" || animType === "hiit")
      ? (1.3 - wave * 2.3)
      : 1.1;
    const handL = {
      x: shoulder.x - 14 - Math.cos(armAngle) * 38,
      y: shoulder.y + Math.sin(armAngle) * 38
    };
    const handR = {
      x: shoulder.x + 14 + Math.cos(armAngle) * 38,
      y: shoulder.y + Math.sin(armAngle) * 38
    };
    draw3DCapsule(ctx, shoulder.x - 12, shoulder.y, handL.x, handL.y, 6, 4, skin, skinHi);
    draw3DCapsule(ctx, shoulder.x + 12, shoulder.y, handR.x, handR.y, 6, 4, skin, skinHi);
  }

  ctx.restore();
}

/* =========================================================
   2. DADOS DOS PERFIS (5 TREINOS SEGUNDA A SEXTA + TMB BASAL)
   ========================================================= */
const WEEKDAYS_PT = ["Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado", "Domingo"];

const DEFAULT_DATA = {
  victor: {
    name: "Victor",
    subtitle: "Definição Muscular & Barriga (-2 kg) | Joelho Esquerdo Protegido",
    bmr: 1945,       // TMB calculada: 1,89m / 89kg / 24 anos
    baseTdee: 2650,  // Gasto diário base antes do treino
    goalKcal: 2150,  // Meta com déficit para definição
    goalProtein: 175,
    water: "3,1 L",
    defaultRestSeconds: 45,
    // 5 tipos de treino distintos (Segunda a Sexta) - 3 séries cada, zero objetos caseiros
    weeklyWorkouts: [
      {
        focus: "Segunda: Peito & Barriga Supra",
        exercises: [
          { title: "Flexão Declinada (Pés no Sofá)", sets: 3, baseReps: 12, execSeconds: 40, anim: "pushup", desc: "Pés elevados no sofá/cadeira, desça o peito controlando em 3s." },
          { title: "Mergulho Profundo na Cadeira", sets: 3, baseReps: 12, execSeconds: 40, anim: "dip", desc: "Tronco inclinado à frente, cotovelos a 90° e subida explosiva." },
          { title: "Flexão Diamante (Miolo do Peito)", sets: 3, baseReps: 10, execSeconds: 35, anim: "pushup", desc: "Mãos próximas formando um triângulo sob o esterno." },
          { title: "Abdominal Supra Curto com Pausa", sets: 3, baseReps: 20, execSeconds: 40, anim: "crunch", desc: "Tire apenas as escápulas do chão e segure 2s no topo contraindo o abdômen." },
          { title: "Prancha com Toque no Ombro", sets: 3, baseReps: 16, execSeconds: 40, anim: "plank", desc: "Quadril travado sem balançar enquanto toca o ombro oposto." }
        ]
      },
      {
        focus: "Terça: Ombros 3D & Barriga Infra",
        exercises: [
          { title: "Flexão Pike (Ombro Anterior/Médio)", sets: 3, baseReps: 10, execSeconds: 40, anim: "pushup", desc: "Quadril bem alto em V invertido, desça a cabeça à frente das mãos." },
          { title: "Elevação Lateral Isométrica + Pulso", sets: 3, baseReps: 25, execSeconds: 40, anim: "shoulder", desc: "Braços abertos na altura dos ombros, faça pulsos curtos contínuos sem baixar." },
          { title: "Anjo Invertido no Solo (Posterior)", sets: 3, baseReps: 15, execSeconds: 40, anim: "shoulder", desc: "De bruços, desenhe um arco amplo com os braços estendidos." },
          { title: "Elevação de Pernas no Solo (Infra)", sets: 3, baseReps: 15, execSeconds: 40, anim: "legraise", desc: "Mãos sob o quadril, desça as pernas estendidas devagar sem tocar o chão." },
          { title: "Abdominal Canivete Alternado", sets: 3, baseReps: 16, execSeconds: 40, anim: "crunch", desc: "Suba o tronco tocando a mão direita no pé esquerdo e alterne." }
        ]
      },
      {
        focus: "Quarta: Inferiores (Joelho Seguro) & Core",
        exercises: [
          { title: "Elevação Pélvica Unilateral", sets: 3, baseReps: 12, execSeconds: 40, anim: "bridge", desc: "Pé de apoio mais à frente (ângulo > 90° para zero pressão na patela esquerda)." },
          { title: "Bom Dia (Posterior e Lombar)", sets: 3, baseReps: 15, execSeconds: 40, anim: "sumo", desc: "Joelhos quase estendidos, empurre o quadril para trás mantendo coluna reta." },
          { title: "Abdução Lateral de Quadril", sets: 3, baseReps: 20, execSeconds: 35, anim: "bridge", desc: "Fortalece o glúteo médio para estabilizar o alinhamento da patela." },
          { title: "Prancha Urso (Joelho Flutuando)", sets: 3, baseReps: 40, execSeconds: 40, anim: "plank", desc: "Joelhos a 3 cm do solo sem impacto articular; foco total no abdômen profundo." },
          { title: "Abdominal Bicicleta Lento", sets: 3, baseReps: 20, execSeconds: 40, anim: "crunch", desc: "Gire o cotovelo em direção ao joelho oposto em cadência controlada." }
        ]
      },
      {
        focus: "Quinta: Peito, Tríceps & Oblíquos",
        exercises: [
          { title: "Flexão Arqueiro (Foco Unilateral)", sets: 3, baseReps: 10, execSeconds: 40, anim: "pushup", desc: "Um braço estendido na lateral enquanto o outro sustenta o peso." },
          { title: "Mergulho na Cadeira com Pausa", sets: 3, baseReps: 12, execSeconds: 40, anim: "dip", desc: "Segure 2 segundos no ponto mais baixo antes de empurrar." },
          { title: "Flexão Explosiva (Com Impulso)", sets: 3, baseReps: 10, execSeconds: 35, anim: "pushup", desc: "Desça controlado e empurre rápido tirando levemente as mãos do solo." },
          { title: "Abdominal Oblíquo Cruzado", sets: 3, baseReps: 18, execSeconds: 40, anim: "crunch", desc: "Tornozelo apoiado no joelho oposto, leve o ombro em direção ao joelho." },
          { title: "Escalador Cruzado (Mountain Climber)", sets: 3, baseReps: 24, execSeconds: 40, anim: "mountain", desc: "Puxe o joelho em direção ao cotovelo oposto trabalhando a linha lateral da barriga." }
        ]
      },
      {
        focus: "Sexta: Ombros, Core Completo & Queima",
        exercises: [
          { title: "Prancha Dinâmica (Sobe e Desce)", sets: 3, baseReps: 12, execSeconds: 40, anim: "plank", desc: "Alterne apoio de antebraços e mãos mantendo ombros e core travados." },
          { title: "Círculos de Braço em Tensão", sets: 3, baseReps: 30, execSeconds: 40, anim: "shoulder", desc: "Braços abertos em T, gire rápido para frente e para trás até queimar deltoides." },
          { title: "Abdominal Infra Tesoura", sets: 3, baseReps: 20, execSeconds: 40, anim: "legraise", desc: "Alterne as pernas estendidas a poucos centímetros do chão." },
          { title: "Vácuo Abdominal + Prancha", sets: 3, baseReps: 35, execSeconds: 35, anim: "plank", desc: "Puxe o umbigo contra as costas durante toda a sustentação." },
          { title: "Shadow Boxing Intenso (Sem Impacto)", sets: 3, baseReps: 45, execSeconds: 45, anim: "hiit", desc: "Socos rápidos contínuos em pé para queimar calorias sem sobrecarregar o joelho." }
        ]
      }
    ],
    foodSuggestions: {
      cafe: [
        { id: "v_c1", name: "Ovo inteiro mexido/cozido (1 unid.)", kcal: 75, protein: 6 },
        { id: "v_c2", name: "Pão integral (2 fatias)", kcal: 130, protein: 6 },
        { id: "v_c3", name: "Banana prata média (1 unid.)", kcal: 90, protein: 1 },
        { id: "v_c4", name: "Queijo minas frescal (50g)", kcal: 120, protein: 8.5 }
      ],
      lanche: [
        { id: "v_l1", name: "Whey Protein (1 scoop 30g)", kcal: 120, protein: 24 },
        { id: "v_l2", name: "Iogurte natural desnatado (170g)", kcal: 65, protein: 6.5 },
        { id: "v_l3", name: "Frango desfiado temperado (100g)", kcal: 165, protein: 31 },
        { id: "v_l4", name: "Aveia em flocos (30g)", kcal: 115, protein: 4.2 }
      ],
      almoco: [
        { id: "v_a1", name: "Peito de frango grelhado (100g)", kcal: 165, protein: 31 },
        { id: "v_a2", name: "Patinho moído refogado (100g)", kcal: 215, protein: 35 },
        { id: "v_a3", name: "Arroz branco ou integral cozido (100g)", kcal: 128, protein: 2.5 },
        { id: "v_a4", name: "Feijão carioca/preto (100g)", kcal: 76, protein: 4.8 },
        { id: "v_a5", name: "Salada verde + legumes à vontade", kcal: 35, protein: 1.5 }
      ],
      jantar: [
        { id: "v_j1", name: "Filé de tilápia grelhado (150g)", kcal: 145, protein: 30 },
        { id: "v_j2", name: "Peito de frango grelhado (150g)", kcal: 248, protein: 46.5 },
        { id: "v_j3", name: "Batata inglesa ou doce cozida (150g)", kcal: 115, protein: 2 },
        { id: "v_j4", name: "Omelete de 3 ovos", kcal: 225, protein: 18 }
      ]
    }
  },

  samira: {
    name: "Samira",
    subtitle: "Emagrecer (-4 a 5 kg até o Natal) & Retenção | HIIT + Definição",
    bmr: 1585,       // TMB calculada: 1,65m / 85kg
    baseTdee: 2120,  // Gasto diário base antes do HIIT
    goalKcal: 1550,
    goalProtein: 125,
    water: "3,0 L",
    defaultRestSeconds: 20,
    weeklyWorkouts: [
      {
        focus: "Segunda: HIIT Queima Total & Coxas",
        exercises: [
          { title: "Polichinelo Acelerado", sets: 3, baseReps: 40, execSeconds: 40, anim: "hiit", desc: "Ritmo intenso por 40s para acelerar o metabolismo." },
          { title: "Agachamento Sumô Pulsado", sets: 3, baseReps: 16, execSeconds: 40, anim: "sumo", desc: "Pés bem afastados para ativar parte interna das coxas e glúteos." },
          { title: "Corrida Estacionária (Skipping Alto)", sets: 3, baseReps: 40, execSeconds: 40, anim: "hiit", desc: "Eleve bem os joelhos alternando os braços." },
          { title: "Elevação Pélvica (Drenagem Pernas)", sets: 3, baseReps: 20, execSeconds: 40, anim: "bridge", desc: "Ativa o retorno venoso das pernas e combate a retenção." },
          { title: "Abdominal Supra Curto", sets: 3, baseReps: 20, execSeconds: 35, anim: "crunch", desc: "Contração firme no topo expirando todo o ar." }
        ]
      },
      {
        focus: "Terça: Core, Cintura & Cardio",
        exercises: [
          { title: "Escalador (Mountain Climber)", sets: 3, baseReps: 30, execSeconds: 40, anim: "mountain", desc: "Puxe os joelhos rápido em direção ao peito." },
          { title: "Prancha com Toque no Ombro", sets: 3, baseReps: 16, execSeconds: 40, anim: "plank", desc: "Mantém a cintura firme e trabalha braços e ombros." },
          { title: "Abdominal Infra (Elevação de Pernas)", sets: 3, baseReps: 15, execSeconds: 40, anim: "legraise", desc: "Foco na parte inferior do abdômen." },
          { title: "Shadow Boxing Rápido", sets: 3, baseReps: 40, execSeconds: 40, anim: "hiit", desc: "Socos rápidos contínuos girando a cintura." },
          { title: "Abdominal Bicicleta", sets: 3, baseReps: 20, execSeconds: 40, anim: "crunch", desc: "Define a linha lateral do abdômen." }
        ]
      },
      {
        focus: "Quarta: Glúteos, Posterior & HIIT",
        exercises: [
          { title: "Elevação Pélvica Unilateral", sets: 3, baseReps: 12, execSeconds: 40, anim: "bridge", desc: "Segure 2s no alto contraindo bem o glúteo." },
          { title: "Agachamento Sumô + Panturrilha", sets: 3, baseReps: 15, execSeconds: 40, anim: "sumo", desc: "Suba do agachamento ficando na ponta dos pés (bomba linfática)." },
          { title: "Polichinelo Frontal (Tesoura)", sets: 3, baseReps: 40, execSeconds: 40, anim: "hiit", desc: "Alterne braços e pernas à frente em ritmo acelerado." },
          { title: "Prancha Isométrica", sets: 3, baseReps: 35, execSeconds: 35, anim: "plank", desc: "Umbigo para dentro e glúteos contraídos." },
          { title: "Abdominal Tesoura Infra", sets: 3, baseReps: 20, execSeconds: 40, anim: "legraise", desc: "Pernas estendidas alternando curtinho." }
        ]
      },
      {
        focus: "Quinta: Superiores, Postura & Abdômen",
        exercises: [
          { title: "Mergulho na Cadeira (Tríceps/Tchauzinho)", sets: 3, baseReps: 12, execSeconds: 40, anim: "dip", desc: "Firmeza na parte posterior dos braços." },
          { title: "Elevação Lateral de Ombros", sets: 3, baseReps: 20, execSeconds: 40, anim: "shoulder", desc: "Movimento contínuo até a altura dos ombros." },
          { title: "Flexão Inclinada no Sofá", sets: 3, baseReps: 12, execSeconds: 40, anim: "pushup", desc: "Mãos apoiadas no sofá para trabalhar peito e braços." },
          { title: "Escalador Cruzado", sets: 3, baseReps: 24, execSeconds: 40, anim: "mountain", desc: "Joelho em direção ao cotovelo oposto." },
          { title: "Abdominal Supra + Infra Combinado", sets: 3, baseReps: 15, execSeconds: 40, anim: "crunch", desc: "Aproxime joelhos e cotovelos no centro." }
        ]
      },
      {
        focus: "Sexta: Desafio HIIT Metabólico",
        exercises: [
          { title: "Corrida Estacionária Intensa", sets: 3, baseReps: 45, execSeconds: 45, anim: "hiit", desc: "Máxima velocidade nos últimos 15 segundos." },
          { title: "Agachamento Sumô Dinâmico", sets: 3, baseReps: 18, execSeconds: 40, anim: "sumo", desc: "Desça controlando e suba rápido." },
          { title: "Polichinelo Acelerado", sets: 3, baseReps: 45, execSeconds: 45, anim: "hiit", desc: "Mantenha a respiração ritmada." },
          { title: "Elevação de Pernas Infra", sets: 3, baseReps: 15, execSeconds: 40, anim: "legraise", desc: "Controle a descida sem tirar a lombar do chão." },
          { title: "Prancha Final de Resistência", sets: 3, baseReps: 40, execSeconds: 40, anim: "plank", desc: "Feche a semana com o core ativado." }
        ]
      }
    ],
    foodSuggestions: {
      cafe: [
        { id: "s_c1", name: "Ovo mexido ou cozido (1 unid.)", kcal: 75, protein: 6 },
        { id: "s_c2", name: "Pão integral (1 fatia)", kcal: 65, protein: 3 },
        { id: "s_c3", name: "Tapioca hidratada (2 col. sopa / 40g)", kcal: 96, protein: 0 },
        { id: "s_c4", name: "Melão ou Mamão (1 fatia 150g)", kcal: 55, protein: 1 },
        { id: "s_c5", name: "Café preto ou Chá verde sem açúcar", kcal: 2, protein: 0 }
      ],
      lanche: [
        { id: "s_l1", name: "Iogurte natural desnatado (170g)", kcal: 65, protein: 6.5 },
        { id: "s_l2", name: "Whey Protein (1 scoop 30g)", kcal: 120, protein: 24 },
        { id: "s_l3", name: "Melancia ou Abacaxi (1 fatia — diurético)", kcal: 48, protein: 0.8 },
        { id: "s_l4", name: "Castanha-do-pará (2 unidades)", kcal: 55, protein: 1.2 }
      ],
      almoco: [
        { id: "s_a1", name: "Peito de frango grelhado (150g)", kcal: 248, protein: 46.5 },
        { id: "s_a2", name: "Filé de peixe grelhado (150g)", kcal: 145, protein: 30 },
        { id: "s_a3", name: "Arroz integral ou branco (100g)", kcal: 128, protein: 2.5 },
        { id: "s_a4", name: "Feijão cozido (1 concha / 80g)", kcal: 61, protein: 3.8 },
        { id: "s_a5", name: "Salada verde + pepino + limão", kcal: 25, protein: 1 }
      ],
      jantar: [
        { id: "s_j1", name: "Frango desfiado (130g)", kcal: 215, protein: 40 },
        { id: "s_j2", name: "Omelete de 3 ovos com legumes", kcal: 240, protein: 18 },
        { id: "s_j3", name: "Legumes cozidos (abobrinha/chuchu/brócolis 150g)", kcal: 45, protein: 2.5 },
        { id: "s_j4", name: "Sopa leve de legumes com frango (1 prato)", kcal: 260, protein: 28 }
      ]
    }
  }
};

const MEAL_LABELS = {
  cafe: "07:00 — Sugestões para Café da Manhã",
  lanche: "12:00 — Sugestões para Lanche",
  almoco: "15:30 — Sugestões para Almoço",
  jantar: "21:30 — Sugestões para Jantar"
};

/* =========================================================
   3. ESTADO E PERSISTÊNCIA NO LOCALSTORAGE
   ========================================================= */
const STORAGE_KEY = "desafio_30d_v3";
let state = loadState();
let animClock = 0;

let playerState = {
  active: false,
  exercise: null,
  doneKey: "",
  currentSet: 1,
  phase: "exec",
  secondsLeft: 40,
  paused: false,
  intervalId: null
};

function loadState() {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      return JSON.parse(raw);
    } catch (e) {
      console.error(e);
    }
  }
  return {
    activeProfile: "victor",
    currentDay: 1,
    avatars: { victor: "", samira: "" },
    data: JSON.parse(JSON.stringify(DEFAULT_DATA)),
    progress: {
      victor: {
        completedDays: [],
        workoutsDone: {},
        foodLog: {},
        dayMode: {},       // 'regular' ou 'hiit' por dia
        hiitLogs: {},      // { day_1: { name, duration, kcal } }
        dayFeedback: {},   // { day_1: 'easy' | 'medium' | 'hard' }
        intensityScale: 1.0
      },
      samira: {
        completedDays: [],
        workoutsDone: {},
        foodLog: {},
        dayMode: {},
        hiitLogs: {},
        dayFeedback: {},
        intensityScale: 1.0
      }
    }
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

/* =========================================================
   4. LOOP GLOBAL DAS ANIMAÇÕES 3D EM CANVAS (60 FPS)
   ========================================================= */
function start3DAnimationLoop() {
  function loop() {
    animClock += 0.03;
    const accent = state.activeProfile === "samira" ? "#ec4899" : "#10b981";

    // Renderiza todos os mini-canvas 3D visíveis na grade
    document.querySelectorAll("canvas[data-anim]").forEach((canvas) => {
      render3DFrame(canvas, canvas.dataset.anim, animClock, accent);
    });

    // Renderiza o canvas grande do player ativo
    if (playerState.active && playerState.exercise) {
      const playerCanvas = document.getElementById("player-3d-canvas");
      if (playerCanvas) {
        const phaseColor = playerState.phase === "rest" ? "#3b82f6" : accent;
        render3DFrame(playerCanvas, playerState.exercise.anim, animClock, phaseColor);
      }
    }

    requestAnimationFrame(loop);
  }
  requestAnimationFrame(loop);
}

/* =========================================================
   5. RENDERIZAÇÃO GERAL E CÁLCULOS METABÓLICOS
   ========================================================= */
function getDayWorkoutData(profile, day, intensityScale) {
  const dayOfWeekIndex = (day - 1) % 7; // 0=Seg ... 4=Sex, 5=Sáb, 6=Dom

  if (dayOfWeekIndex === 5) {
    return {
      focus: "Sábado: Cardio Livre & Mobilidade",
      exercises: [
        {
          title: "Caminhada Acelerada ou HIIT Leve",
          sets: 3,
          baseReps: 60,
          execSeconds: Math.round(60 * intensityScale),
          anim: "hiit",
          desc: "Ritmo constante para estimular queima calórica sem desgaste articular."
        }
      ]
    };
  }
  if (dayOfWeekIndex === 6) {
    return {
      focus: "Domingo: Descanso Ativo & Hidratação",
      exercises: [
        {
          title: "Alongamento + Respiração Diafragmática",
          sets: 3,
          baseReps: 40,
          execSeconds: 40,
          anim: "bridge",
          desc: "Recuperação muscular e controle da retenção de líquidos."
        }
      ]
    };
  }

  const baseCycle = profile.weeklyWorkouts[dayOfWeekIndex];
  return {
    focus: baseCycle.focus,
    exercises: baseCycle.exercises.map((ex) => ({
      ...ex,
      scaledReps: Math.max(6, Math.round(ex.baseReps * intensityScale)),
      scaledSeconds: Math.max(25, Math.round(ex.execSeconds * intensityScale))
    }))
  };
}

function renderApp() {
  const key = state.activeProfile;
  const profile = state.data[key];
  const prog = state.progress[key];
  const day = state.currentDay;
  const weekdayName = WEEKDAYS_PT[(day - 1) % 7];
  const scale = prog.intensityScale || 1.0;

  // Tema e Avatares
  document.body.classList.toggle("theme-samira", key === "samira");
  document.querySelectorAll(".avatar-btn").forEach((btn) => {
    btn.classList.toggle("active", btn.dataset.profile === key);
  });

  ["victor", "samira"].forEach((p) => {
    const imgEl = document.getElementById(`avatar-img-${p}`);
    const fallbackEl = document.getElementById(`avatar-fallback-${p}`);
    if (state.avatars[p]) {
      imgEl.src = state.avatars[p];
      imgEl.classList.remove("hidden");
      fallbackEl.classList.add("hidden");
    } else {
      imgEl.classList.add("hidden");
      fallbackEl.classList.remove("hidden");
    }
  });

  // Cabeçalho
  document.getElementById("header-title").textContent = `Desafio 30 Dias — ${profile.name}`;
  document.getElementById("header-subtitle").textContent = profile.subtitle;
  document.getElementById("edit-profile-name").textContent = profile.name;
  document.getElementById("current-day-label").textContent = `Dia ${day} / 30 (${weekdayName})`;
  document.getElementById("day-completed-checkbox").checked = prog.completedDays.includes(day);

  // Barra de Progresso e Escala Adaptativa
  const doneCount = prog.completedDays.length;
  const pct = Math.round((doneCount / 30) * 100);
  document.getElementById("progress-text").textContent = `${doneCount} / 30 dias (${pct}%)`;
  document.getElementById("progress-fill").style.width = `${pct}%`;
  document.getElementById("difficulty-status-pill").textContent = `Intensidade: ${Math.round(scale * 100)}%`;

  // Modalidade do Dia (Treino Comum vs Cardio HIIT)
  const mode = prog.dayMode[`day_${day}`] || "regular";
  const hiitEntry = prog.hiitLogs[`day_${day}`] || null;
  let workoutBurn = 0;

if (mode === "hiit") {
  workoutBurn = hiitEntry ? Number(hiitEntry.kcal) : 0;
} else {
  const dayWorkout = getDayWorkoutData(profile, day, scale);
  const kcalPerExercise = key === "victor" ? 60 : 72;

  if (prog.completedDays.includes(day)) {
    workoutBurn = dayWorkout.exercises.length * kcalPerExercise;
  } else {
    dayWorkout.exercises.forEach((_, idx) => {
      if (prog.workoutsDone[`d${day}_ex${idx}`]) {
        workoutBurn += kcalPerExercise;
      }
    });
  }
}

  document.getElementById("mode-regular-btn").classList.toggle("active", mode === "regular");
  document.getElementById("mode-hiit-btn").classList.toggle("active", mode === "hiit");
  document.getElementById("hiit-custom-panel").classList.toggle("hidden", mode !== "hiit");
  document.getElementById("regular-workout-wrapper").classList.toggle("hidden", mode === "hiit");

  if (mode === "hiit") {
    document.getElementById("current-day-focus").textContent = hiitEntry
      ? `Cardio HIIT: ${hiitEntry.name}`
      : "Cardio HIIT Personalizado";

    const summaryBox = document.getElementById("hiit-saved-summary");
    if (hiitEntry) {
      document.getElementById("hiit-name-input").value = hiitEntry.name;
      document.getElementById("hiit-duration-input").value = hiitEntry.duration;
      document.getElementById("hiit-kcal-input").value = hiitEntry.kcal;
      summaryBox.classList.remove("hidden");
      summaryBox.innerHTML = `
        <div>
          <strong>🔥 ${hiitEntry.name}</strong>
          <div class="subtitle">Duração: ${hiitEntry.duration} min • Gasto abatido hoje: ${hiitEntry.kcal} kcal</div>
        </div>
        <button type="button" id="delete-hiit-btn" class="btn danger small">Remover HIIT</button>
      `;
      summaryBox.querySelector("#delete-hiit-btn").addEventListener("click", () => {
        delete prog.hiitLogs[`day_${day}`];
        saveState();
        renderApp();
      });
    } else {
      document.getElementById("hiit-form").reset();
      summaryBox.classList.add("hidden");
    }
  } else {
    const dayWorkout = getDayWorkoutData(profile, day, scale);
    document.getElementById("current-day-focus").textContent = dayWorkout.focus;
    renderWorkouts(dayWorkout.exercises);
  }

  // Feedback Pós-Treino do Dia
  const currentFb = prog.dayFeedback[`day_${day}`] || "";
  document.querySelectorAll(".fb-btn").forEach((btn) => {
    btn.classList.toggle("selected", btn.dataset.feedback === currentFb);
  });
  const fbMsgEl = document.getElementById("feedback-status-msg");
  if (currentFb === "easy") {
    fbMsgEl.textContent = "Feedback registrado: Fácil! Aumentamos em +15% as repetições e tempos para desafiar você.";
  } else if (currentFb === "hard") {
    fbMsgEl.textContent = "Feedback registrado: Difícil! Ajustamos em -10% o volume para manter boa execução sem fadiga excessiva.";
  } else if (currentFb === "medium") {
    fbMsgEl.textContent = "Feedback registrado: Ideal! Mantendo a progressão atual.";
  } else {
    fbMsgEl.textContent = "";
  }

  // Alimentação + Cálculos com TMB Basal e Queima do Treino
  renderDiet(workoutBurn);
  renderManageFoods();
}

/* =========================================================
   6. RENDERIZAÇÃO DOS EXERCÍCIOS E PLAYER AUTOMÁTICO
   ========================================================= */
function renderWorkouts(exercises) {
  const container = document.getElementById("workout-list");
  const key = state.activeProfile;
  const day = state.currentDay;
  container.innerHTML = "";

  exercises.forEach((ex, idx) => {
    const doneKey = `d${day}_ex${idx}`;
    const isDone = !!state.progress[key].workoutsDone[doneKey];
    const repsText = ex.scaledReps ? `${ex.scaledReps} reps/seg` : `${ex.baseReps} reps`;
    const execSec = ex.scaledSeconds || ex.execSeconds;

    const card = document.createElement("div");
    card.className = `workout-card ${isDone ? "done" : ""}`;
    card.innerHTML = `
      <div class="workout-canvas-box">
        <canvas width="220" height="180" data-anim="${ex.anim}"></canvas>
      </div>
      <div class="workout-card-top">
        <div>
          <h3>${ex.title}</h3>
          <span class="workout-meta">${ex.sets} séries x ${repsText} • ${execSec}s ativo</span>
        </div>
        <input type="checkbox" class="item-check" ${isDone ? "checked" : ""} />
      </div>
      <p class="workout-desc">${ex.desc}</p>
      <button type="button" class="btn primary full-width start-ex-btn">▶ Iniciar Exercício</button>
    `;

    card.querySelector(".item-check").addEventListener("change", (e) => {
      if (e.target.checked) {
        state.progress[key].workoutsDone[doneKey] = true;
      } else {
        delete state.progress[key].workoutsDone[doneKey];
      }
      saveState();
      renderWorkouts(exercises);
    });

    card.querySelector(".start-ex-btn").addEventListener("click", () => {
      startExercisePlayer({ ...ex, execSeconds: execSec, repsText }, doneKey);
    });

    container.appendChild(card);
  });
}

function playAlertTone(freq = 880) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.frequency.setValueAtTime(freq, ctx.currentTime);
    gain.gain.setValueAtTime(0.2, ctx.currentTime);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.35);
  } catch (e) {}
}

function startExercisePlayer(exercise, doneKey) {
  clearInterval(playerState.intervalId);
  playerState = {
    active: true,
    exercise,
    doneKey,
    currentSet: 1,
    phase: "exec",
    secondsLeft: exercise.execSeconds,
    paused: false,
    intervalId: null
  };

  document.getElementById("active-workout-player").classList.remove("hidden");
  document.getElementById("active-workout-player").scrollIntoView({ behavior: "smooth" });
  updatePlayerUI();

  playerState.intervalId = setInterval(tickPlayer, 1000);
}

function tickPlayer() {
  if (!playerState.active || playerState.paused) return;
  if (playerState.secondsLeft > 0) {
    playerState.secondsLeft--;
    updatePlayerUI();
  } else {
    advancePlayerPhase();
  }
}

function advancePlayerPhase() {
  const restSeconds = state.data[state.activeProfile].defaultRestSeconds;

  if (playerState.phase === "exec") {
    playAlertTone(660);
    if (playerState.currentSet >= playerState.exercise.sets) {
      state.progress[state.activeProfile].workoutsDone[playerState.doneKey] = true;
      saveState();
      closePlayer();
      renderApp();
      alert(`Exercício "${playerState.exercise.title}" concluído!`);
      return;
    }
    playerState.phase = "rest";
    playerState.secondsLeft = restSeconds;
  } else {
    playAlertTone(980);
    playerState.phase = "exec";
    playerState.currentSet++;
    playerState.secondsLeft = playerState.exercise.execSeconds;
  }
  updatePlayerUI();
}

function updatePlayerUI() {
  const card = document.getElementById("active-workout-player");
  const badge = document.getElementById("player-phase-badge");
  const isRest = playerState.phase === "rest";

  card.classList.toggle("rest-mode", isRest);
  badge.className = `phase-badge ${isRest ? "rest" : "exec"}`;
  badge.textContent = isRest ? "DESCANSO PADRONIZADO" : "EM EXECUÇÃO";

  document.getElementById("player-exercise-title").textContent = isRest
    ? `Descanse — Próxima: Série ${playerState.currentSet + 1} de ${playerState.exercise.sets}`
    : playerState.exercise.title;

  document.getElementById("player-exercise-meta").textContent =
    `Série ${playerState.currentSet} de ${playerState.exercise.sets} | ${playerState.exercise.repsText}`;

  document.getElementById("player-exercise-desc").textContent = isRest
    ? "Recupere o fôlego. A próxima série inicia automaticamente ao zerar."
    : playerState.exercise.desc;

  const mins = String(Math.floor(playerState.secondsLeft / 60)).padStart(2, "0");
  const secs = String(playerState.secondsLeft % 60).padStart(2, "0");
  document.getElementById("player-timer-display").textContent = `${mins}:${secs}`;
  document.getElementById("player-pause-resume-btn").textContent = playerState.paused ? "Retomar" : "Pausar";
}

function closePlayer() {
  clearInterval(playerState.intervalId);
  playerState.active = false;
  document.getElementById("active-workout-player").classList.add("hidden");
}

/* =========================================================
   7. ALIMENTAÇÃO + BALANÇO COM METABOLISMO BASAL E TREINO
   ========================================================= */
function renderDiet(workoutBurn) {
  const key = state.activeProfile;
  const profile = state.data[key];
  const day = state.currentDay;
  const dayLog = state.progress[key].foodLog[`day_${day}`] || {};

  let totalKcal = 0;
  let totalProtein = 0;

  const container = document.getElementById("diet-suggestions-container");
  container.innerHTML = "";

  Object.keys(MEAL_LABELS).forEach((mealKey) => {
    const items = profile.foodSuggestions[mealKey] || [];
    const groupCard = document.createElement("div");
    groupCard.className = "card meal-group-card";
    groupCard.innerHTML = `<h3>${MEAL_LABELS[mealKey]}</h3>`;

    items.forEach((food) => {
      const entry = dayLog[food.id] || { checked: false, qty: 1 };
      if (entry.checked) {
        totalKcal += food.kcal * entry.qty;
        totalProtein += food.protein * entry.qty;
      }

      const row = document.createElement("div");
      row.className = `food-suggestion-row ${entry.checked ? "checked" : ""}`;
      row.innerHTML = `
        <div class="food-left">
          <input type="checkbox" ${entry.checked ? "checked" : ""} />
          <div class="food-info">
            <strong>${food.name}</strong>
            <span>Por porção: ${food.kcal} kcal • ${food.protein}g proteína</span>
          </div>
        </div>
        <div class="qty-control">
          <button type="button" class="qty-btn minus">-</button>
          <span class="qty-value">${entry.qty}x</span>
          <button type="button" class="qty-btn plus">+</button>
        </div>
      `;

      const updateEntry = (newChecked, newQty) => {
        if (!state.progress[key].foodLog[`day_${day}`]) {
          state.progress[key].foodLog[`day_${day}`] = {};
        }
        state.progress[key].foodLog[`day_${day}`][food.id] = {
          checked: newChecked,
          qty: Math.max(0.5, newQty)
        };
        saveState();
        renderDiet(workoutBurn);
      };

      row.querySelector("input[type='checkbox']").addEventListener("change", (e) => {
        updateEntry(e.target.checked, entry.qty);
      });
      row.querySelector(".minus").addEventListener("click", () => updateEntry(true, entry.qty - 0.5));
      row.querySelector(".plus").addEventListener("click", () => updateEntry(true, entry.qty + 0.5));

      groupCard.appendChild(row);
    });

    container.appendChild(groupCard);
  });

  // Atualiza barra metabólica considerando TMB + Queima do Treino/HIIT
  const consumedRounded = Math.round(totalKcal);
  const adjustedGoal = profile.goalKcal + Math.max(0, workoutBurn - 260);
  const netBalance = consumedRounded - (profile.bmr + workoutBurn);

  document.getElementById("bmr-display").textContent = `${profile.bmr.toLocaleString("pt-BR")} kcal`;
  document.getElementById("tdee-display").textContent = `${profile.baseTdee.toLocaleString("pt-BR")} kcal`;
  document.getElementById("workout-burn-display").textContent = `-${workoutBurn} kcal`;
  document.getElementById("net-kcal-display").textContent = `${netBalance} kcal (vs TMB+Treino)`;

  document.getElementById("consumed-kcal").textContent = consumedRounded;
  document.getElementById("goal-kcal").textContent = adjustedGoal;
  document.getElementById("consumed-protein").textContent = totalProtein.toFixed(1).replace(".0", "");
  document.getElementById("goal-protein").textContent = profile.goalProtein;
  document.getElementById("goal-water").textContent = profile.water;
}

/* =========================================================
   8. GERENCIAMENTO DE ALIMENTOS
   ========================================================= */
function renderManageFoods() {
  const key = state.activeProfile;
  const suggestions = state.data[key].foodSuggestions;
  const listEl = document.getElementById("manage-foods-list");
  listEl.innerHTML = "";

  Object.keys(MEAL_LABELS).forEach((mealKey) => {
    (suggestions[mealKey] || []).forEach((food) => {
      const item = document.createElement("div");
      item.className = "manage-food-item";
      item.innerHTML = `
        <div>
          <strong>[${mealKey.toUpperCase()}] ${food.name}</strong>
          <div class="subtitle">${food.kcal} kcal | ${food.protein}g proteína</div>
        </div>
        <button type="button" class="btn danger small">Excluir</button>
      `;
      item.querySelector("button").addEventListener("click", () => {
        state.data[key].foodSuggestions[mealKey] = suggestions[mealKey].filter((f) => f.id !== food.id);
        saveState();
        renderApp();
      });
      listEl.appendChild(item);
    });
  });
}

/* =========================================================
   9. EVENTOS DE INTERAÇÃO
   ========================================================= */
document.addEventListener("DOMContentLoaded", () => {
  // Troca de Perfil
  document.querySelectorAll(".avatar-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      closePlayer();
      state.activeProfile = btn.dataset.profile;
      saveState();
      renderApp();
    });
  });

  // Upload de Foto Circular
  document.querySelectorAll(".avatar-file-input").forEach((input) => {
    input.addEventListener("change", (e) => {
      const file = e.target.files[0];
      if (!file) return;
      const profileKey = input.dataset.profile;
      const reader = new FileReader();
      reader.onload = () => {
        state.avatars[profileKey] = reader.result;
        saveState();
        renderApp();
      };
      reader.readAsDataURL(file);
    });
  });

  // Navegação em Coluna
  document.querySelectorAll(".nav-col-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      document.querySelectorAll(".nav-col-btn").forEach((b) => b.classList.remove("active"));
      document.querySelectorAll(".tab-panel").forEach((p) => p.classList.remove("active"));
      btn.classList.add("active");
      document.getElementById(btn.dataset.tab).classList.add("active");
    });
  });

  // Dias
  document.getElementById("prev-day-btn").addEventListener("click", () => {
    if (state.currentDay > 1) {
      closePlayer();
      state.currentDay--;
      saveState();
      renderApp();
    }
  });

  document.getElementById("next-day-btn").addEventListener("click", () => {
    if (state.currentDay < 30) {
      closePlayer();
      state.currentDay++;
      saveState();
      renderApp();
    }
  });

  document.getElementById("day-completed-checkbox").addEventListener("change", (e) => {
    const key = state.activeProfile;
    const list = state.progress[key].completedDays;
    if (e.target.checked && !list.includes(state.currentDay)) {
      list.push(state.currentDay);
    } else if (!e.target.checked) {
      state.progress[key].completedDays = list.filter((d) => d !== state.currentDay);
    }
    saveState();
    renderApp();
  });

  // Alternar entre Treino Comum e Cardio HIIT
  document.getElementById("mode-regular-btn").addEventListener("click", () => {
    state.progress[state.activeProfile].dayMode[`day_${state.currentDay}`] = "regular";
    saveState();
    renderApp();
  });

  document.getElementById("mode-hiit-btn").addEventListener("click", () => {
    closePlayer();
    state.progress[state.activeProfile].dayMode[`day_${state.currentDay}`] = "hiit";
    saveState();
    renderApp();
  });

  document.getElementById("restore-regular-btn").addEventListener("click", () => {
    state.progress[state.activeProfile].dayMode[`day_${state.currentDay}`] = "regular";
    saveState();
    renderApp();
  });

  // Salvar Cardio HIIT Editável
  document.getElementById("hiit-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const key = state.activeProfile;
    const day = state.currentDay;
    state.progress[key].hiitLogs[`day_${day}`] = {
      name: document.getElementById("hiit-name-input").value.trim(),
      duration: Number(document.getElementById("hiit-duration-input").value),
      kcal: Number(document.getElementById("hiit-kcal-input").value)
    };
    saveState();
    renderApp();
  });

  // Feedback Pós-Treino (Adapta intensidade dos próximos dias)
  document.querySelectorAll(".fb-btn").forEach((btn) => {
    btn.addEventListener("click", () => {
      const fb = btn.dataset.feedback;
      const prog = state.progress[state.activeProfile];
      prog.dayFeedback[`day_${state.currentDay}`] = fb;

      if (fb === "easy") {
        prog.intensityScale = Math.min(1.5, Number(((prog.intensityScale || 1.0) + 0.15).toFixed(2)));
      } else if (fb === "hard") {
        prog.intensityScale = Math.max(0.75, Number(((prog.intensityScale || 1.0) - 0.1).toFixed(2)));
      }

      saveState();
      renderApp();
    });
  });

  // Player
  document.getElementById("close-player-btn").addEventListener("click", closePlayer);
  document.getElementById("player-pause-resume-btn").addEventListener("click", () => {
    playerState.paused = !playerState.paused;
    updatePlayerUI();
  });
  document.getElementById("player-skip-phase-btn").addEventListener("click", advancePlayerPhase);

  // Adicionar Alimento
  document.getElementById("add-food-form").addEventListener("submit", (e) => {
    e.preventDefault();
    const key = state.activeProfile;
    const meal = document.getElementById("food-meal-select").value;
    state.data[key].foodSuggestions[meal].push({
      id: `custom_${Date.now()}`,
      name: document.getElementById("food-name-input").value.trim(),
      kcal: Number(document.getElementById("food-kcal-input").value),
      protein: Number(document.getElementById("food-prot-input").value)
    });
    e.target.reset();
    saveState();
    renderApp();
  });

  // Backup Exportar / Importar
  document.getElementById("export-backup-btn").addEventListener("click", () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(state, null, 2));
    const a = document.createElement("a");
    a.href = dataStr;
    a.download = `backup_desafio30d_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(a);
    a.click();
    a.remove();
  });

  document.getElementById("import-backup-input").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const imported = JSON.parse(reader.result);
        if (imported && imported.data && imported.progress) {
          state = imported;
          saveState();
          renderApp();
          alert("Backup restaurado com sucesso!");
        }
      } catch (err) {
        alert("Arquivo inválido.");
      }
    };
    reader.readAsText(file);
  });

  renderApp();
  start3DAnimationLoop();
});