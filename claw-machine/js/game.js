(function() {
    'use strict';

    console.log('🎮 Jogo da Garra - Iniciando...');
    console.log('📁 Teste no PC - Modo Debug');

    // Configuração do Canvas
    const canvas = document.getElementById('gameCanvas');
    const ctx = canvas.getContext('2d');

    // Dimensões
    let canvasWidth, canvasHeight;

    function resizeCanvas() {
        canvasWidth = window.innerWidth;
        canvasHeight = window.innerHeight;
        canvas.width = canvasWidth;
        canvas.height = canvasHeight;
        console.log(`📐 Canvas redimensionado: ${canvasWidth}x${canvasHeight}`);
    }
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    // Status dos alvos
    const targets = {
        'Lula': { collected: false, points: 1 },
        'Alexandre': { collected: false, points: 1 },
        'Maduro': { collected: true, points: 0 },
        'Ortega': { collected: false, points: 1 },
        'Carmem Lucia': { collected: false, points: 1 },
        'Gilmar mendes': { collected: false, points: 1 }
    };

    console.log('🎯 Alvos configurados:', Object.keys(targets));

    // Estado do jogo
    let score = 0;
    let gameRunning = true;
    let clawX = canvasWidth / 2;
    let clawY = 50;
    let clawMoving = false;
    let clawDirection = 1;
    let clawSpeed = 3;
    let clawGrabbing = false;
    let grabbedTarget = null;
    let moveLeft = false;
    let moveRight = false;
    let imagesLoaded = 0;
    const totalImages = 8;

    // Imagens
    const images = {};
    let items = [];

    // Função para carregar imagens
    function loadImages() {
        console.log('📥 Carregando imagens...');
        const imageFiles = {
            maquina: 'Images/maquina.png',
            trump: 'Images/trump.png',
            Lula: 'Images/Lula.png',
            Alexandre: 'Images/Alexandre.png',
            Maduro: 'Images/Maduro.png',
            Ortega: 'Images/Ortega.png',
            Carmem: 'Images/Carmem Lucia.png',
            Gilmar: 'Images/Gilmar mendes.png'
        };

        let loadedCount = 0;
        const total = Object.keys(imageFiles).length;

        for (let key in imageFiles) {
            const img = new Image();
            img.src = imageFiles[key];
            img.onload = () => {
                loadedCount++;
                console.log(`✅ Imagem carregada: ${key} (${loadedCount}/${total})`);
                if (loadedCount === total) {
                    console.log('🎯 Todas as imagens carregadas!');
                    initGame();
                }
            };
            img.onerror = () => {
                loadedCount++;
                console.error(`❌ Erro ao carregar: ${imageFiles[key]}`);
                if (loadedCount === total) {
                    console.warn('⚠️ Algumas imagens falharam, mas continuando...');
                    initGame();
                }
            };
            images[key] = img;
        }
    }

    // Inicializar jogo
    function initGame() {
        console.log('🎯 Inicializando jogo...');
        
        const targetKeys = Object.keys(targets);
        const availableTargets = targetKeys.filter(key => !targets[key].collected);
        console.log(`📦 Alvos disponíveis: ${availableTargets.length}`);
        
        const spacing = Math.min(150, (canvasWidth - 200) / (availableTargets.length + 1));
        
        availableTargets.forEach((key, index) => {
            const x = 100 + (index + 1) * spacing;
            const y = canvasHeight - 250 + Math.random() * 80;
            
            items.push({
                key: key,
                x: x,
                y: y,
                width: 55,
                height: 55,
                grabbed: false,
                image: images[key] || images['Lula']
            });
            console.log(`📍 Alvo ${key} posicionado em (${Math.round(x)}, ${Math.round(y)})`);
        });

        console.log(`✅ ${items.length} alvos posicionados na máquina`);
        updateUI();
        gameLoop();
    }

    // Desenhar fundo da máquina
    function drawMachine() {
        if (images.maquina && images.maquina.complete && images.maquina.naturalWidth > 0) {
            const aspectRatio = images.maquina.width / images.maquina.height;
            let drawWidth = canvasWidth;
            let drawHeight = canvasWidth / aspectRatio;
            
            if (drawHeight > canvasHeight) {
                drawHeight = canvasHeight;
                drawWidth = canvasHeight * aspectRatio;
            }
            
            const x = (canvasWidth - drawWidth) / 2;
            const y = (canvasHeight - drawHeight) / 2;
            ctx.drawImage(images.maquina, x, y, drawWidth, drawHeight);
        } else {
            // Fallback visual
            const gradient = ctx.createLinearGradient(0, 0, 0, canvasHeight);
            gradient.addColorStop(0, '#1a3a6a');
            gradient.addColorStop(1, '#0a1a3a');
            ctx.fillStyle = gradient;
            ctx.fillRect(50, 50, canvasWidth - 100, canvasHeight - 100);
            
            ctx.strokeStyle = '#4a8ac4';
            ctx.lineWidth = 6;
            ctx.shadowColor = '#4a8ac4';
            ctx.shadowBlur = 20;
            ctx.strokeRect(50, 50, canvasWidth - 100, canvasHeight - 100);
            ctx.shadowBlur = 0;
            
            ctx.fillStyle = 'rgba(255,255,255,0.05)';
            ctx.fillRect(55, 55, canvasWidth - 110, canvasHeight - 110);
        }
    }

    // Desenhar alvos
    function drawItems() {
        items.forEach((item, index) => {
            if (!item.grabbed) {
                const img = item.image || images['Lula'];
                if (img && img.complete && img.naturalWidth > 0) {
                    ctx.shadowColor = 'rgba(255, 215, 0, 0.3)';
                    ctx.shadowBlur = 15;
                    ctx.drawImage(img, item.x - 27, item.y - 27, 54, 54);
                    ctx.shadowBlur = 0;
                    
                    ctx.strokeStyle = '#ffd700';
                    ctx.lineWidth = 2.5;
                    ctx.shadowColor = 'rgba(255, 215, 0, 0.5)';
                    ctx.shadowBlur = 10;
                    ctx.strokeRect(item.x - 27, item.y - 27, 54, 54);
                    ctx.shadowBlur = 0;
                } else {
                    // Fallback com número para debug
                    ctx.fillStyle = '#e74c3c';
                    ctx.shadowColor = 'rgba(231, 76, 60, 0.5)';
                    ctx.shadowBlur = 15;
                    ctx.fillRect(item.x - 27, item.y - 27, 54, 54);
                    ctx.shadowBlur = 0;
                    
                    ctx.fillStyle = 'white';
                    ctx.font = 'bold 14px Arial';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText(`#${index+1}`, item.x, item.y + 2);
                }
            }
        });
    }

    // Desenhar garra
    function drawClaw() {
        const clawWidth = 45;
        const clawHeight = 65;
        const x = clawX - clawWidth / 2;
        const y = clawY;

        // Cabo
        ctx.shadowBlur = 0;
        ctx.strokeStyle = '#7f8c8d';
        ctx.lineWidth = 3;
        ctx.setLineDash([5, 5]);
        ctx.beginPath();
        ctx.moveTo(canvasWidth / 2, 20);
        ctx.lineTo(clawX, clawY + 10);
        ctx.stroke();
        ctx.setLineDash([]);

        // Garra
        if (images.trump && images.trump.complete && images.trump.naturalWidth > 0) {
            ctx.shadowColor = 'rgba(255, 215, 0, 0.3)';
            ctx.shadowBlur = 20;
            ctx.drawImage(images.trump, x, y, clawWidth, clawHeight);
            ctx.shadowBlur = 0;
        } else {
            // Fallback
            ctx.fillStyle = '#f1c40f';
            ctx.shadowColor = 'rgba(241, 196, 15, 0.5)';
            ctx.shadowBlur = 20;
            ctx.fillRect(x, y, clawWidth, clawHeight);
            ctx.shadowBlur = 0;
        }

        // Luz indicadora
        const glowColor = clawGrabbing ? '#e74c3c' : (clawMoving ? '#f39c12' : '#2ecc71');
        ctx.shadowColor = glowColor;
        ctx.shadowBlur = 30;
        ctx.fillStyle = glowColor;
        ctx.beginPath();
        ctx.arc(clawX, y + 15, 10, 0, Math.PI * 2);
        ctx.fill();
        ctx.shadowBlur = 0;
    }

    // Verificar colisão
    function checkCollision(clawX, clawY, item) {
        const clawBox = {
            x: clawX - 35,
            y: clawY - 15,
            width: 70,
            height: 55
        };
        
        const itemBox = {
            x: item.x - 27,
            y: item.y - 27,
            width: 54,
            height: 54
        };
        
        return !(clawBox.x + clawBox.width < itemBox.x ||
                clawBox.x > itemBox.x + itemBox.width ||
                clawBox.y + clawBox.height < itemBox.y ||
                clawBox.y > itemBox.y + itemBox.height);
    }

    // Atualizar UI
    function updateUI() {
        document.getElementById('scoreDisplay').textContent = score;
        
        document.querySelectorAll('.status-item').forEach(el => {
            const target = el.dataset.target;
            if (target && targets[target]) {
                if (targets[target].collected) {
                    el.classList.add('collected');
                    el.textContent = target + ' ✓';
                } else {
                    el.classList.remove('collected');
                    el.textContent = target;
                }
            }
        });
    }

    // Movimento da garra
    function moveClaw() {
        if (!gameRunning) return;

        const margin = 80;
        if (moveLeft && clawX > margin) {
            clawX -= 5;
        }
        if (moveRight && clawX < canvasWidth - margin) {
            clawX += 5;
        }

        if (clawMoving) {
            if (clawDirection === 1) {
                clawY += clawSpeed;
                if (clawY >= canvasHeight - 200) {
                    clawDirection = -1;
                    clawGrabbing = true;
                    
                    let caught = false;
                    items.forEach(item => {
                        if (!item.grabbed && checkCollision(clawX, clawY, item)) {
                            grabbedTarget = item;
                            item.grabbed = true;
                            caught = true;
                            console.log(`🎯 Capturou: ${item.key}`);
                        }
                    });
                    
                    if (!caught) {
                        console.log('❌ Nada capturado');
                        setTimeout(() => {
                            clawGrabbing = false;
                        }, 300);
                    }
                }
            } else {
                clawY -= clawSpeed;
                if (clawY <= 70) {
                    clawMoving = false;
                    clawDirection = 1;
                    clawGrabbing = false;
                    
                    if (grabbedTarget) {
                        const key = grabbedTarget.key;
                        if (!targets[key].collected) {
                            targets[key].collected = true;
                            score += targets[key].points;
                            console.log(`✅ ${key} coletado! Pontuação: ${score}`);
                            updateUI();
                            
                            items = items.filter(item => item !== grabbedTarget);
                            grabbedTarget = null;
                            
                            if (items.length === 0) {
                                gameRunning = false;
                                console.log('🎉 VITÓRIA! Todos os alvos capturados!');
                                setTimeout(() => {
                                    alert('🎉 PARABÉNS! Você capturou todos os alvos!');
                                    location.reload();
                                }, 800);
                            }
                        } else {
                            grabbedTarget = null;
                        }
                    }
                }
            }
        }
    }

    // Loop principal
    function gameLoop() {
        ctx.clearRect(0, 0, canvasWidth, canvasHeight);
        drawMachine();
        drawItems();
        drawClaw();
        moveClaw();
        requestAnimationFrame(gameLoop);
    }

    // Controles
    function setupControls() {
        const btnLeft = document.getElementById('btnLeft');
        const btnRight = document.getElementById('btnRight');
        const btnDown = document.getElementById('btnDown');

        // Teclado
        document.addEventListener('keydown', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') {
                moveLeft = true;
                e.preventDefault();
            }
            if (e.key === 'ArrowRight' || e.key === 'd') {
                moveRight = true;
                e.preventDefault();
            }
            if (e.key === 'ArrowDown' || e.key === ' ' || e.key === 's') {
                e.preventDefault();
                if (!clawMoving && gameRunning) {
                    clawMoving = true;
                    clawDirection = 1;
                    clawGrabbing = false;
                    console.log('⬇ Garra descendo...');
                }
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'ArrowLeft' || e.key === 'a') moveLeft = false;
            if (e.key === 'ArrowRight' || e.key === 'd') moveRight = false;
        });

        // Botões
        btnLeft.addEventListener('mousedown', () => moveLeft = true);
        btnLeft.addEventListener('mouseup', () => moveLeft = false);
        btnLeft.addEventListener('mouseleave', () => moveLeft = false);
        btnLeft.addEventListener('touchstart', (e) => {
            e.preventDefault();
            moveLeft = true;
        });
        btnLeft.addEventListener('touchend', (e) => {
            e.preventDefault();
            moveLeft = false;
        });

        btnRight.addEventListener('mousedown', () => moveRight = true);
        btnRight.addEventListener('mouseup', () => moveRight = false);
        btnRight.addEventListener('mouseleave', () => moveRight = false);
        btnRight.addEventListener('touchstart', (e) => {
            e.preventDefault();
            moveRight = true;
        });
        btnRight.addEventListener('touchend', (e) => {
            e.preventDefault();
            moveRight = false;
        });

        btnDown.addEventListener('click', () => {
            if (!clawMoving && gameRunning) {
                clawMoving = true;
                clawDirection = 1;
                clawGrabbing = false;
                console.log('⬇ Garra descendo...');
            }
        });
        btnDown.addEventListener('touchstart', (e) => {
            e.preventDefault();
            if (!clawMoving && gameRunning) {
                clawMoving = true;
                clawDirection = 1;
                clawGrabbing = false;
                console.log('⬇ Garra descendo...');
            }
        });

        console.log('🎮 Controles configurados!');
        console.log('⌨️ Use Setas ou A/D para mover, Espaço ou S para pegar');
    }

    // Iniciar
    console.log('🚀 Iniciando jogo...');
    loadImages();
    setupControls();
    updateUI();

    // Prevenir scroll
    document.addEventListener('touchmove', (e) => e.preventDefault(), { passive: false });
    document.addEventListener('gesturestart', (e) => e.preventDefault());

})();