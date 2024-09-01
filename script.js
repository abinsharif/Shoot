// Game Variables
const player = document.getElementById('player');
const enemyContainer = document.getElementById('enemy-container');
const gameContainer = document.getElementById('game-container');
const baseHealthDisplay = document.getElementById('base-health');
const scoreDisplay = document.getElementById('score');
const levelDisplay = document.getElementById('level');
const moneyDisplay = document.getElementById('money');
let baseHealth = 100;
let score = 0;
let level = 1;
let money = 0;
let currentWeaponIndex = 0;
let canShoot = true;
let gamePaused = false;
let enemies = [];
let playerSpeed = 10;
let framerate = 30;
let spawnRate = 500;

// Weapon Information
const weapons = [
    { name: 'Sword', damage: 10, reloadTime: 0.5, accuracy: 0.9, range: 50, bulletSpeed: 10, color: 'blue', cost: 50, unlocked: true, ability: 'Melee' , width:10, height:2},
    { name: 'Crossbow', damage: 30, reloadTime: 1.5, accuracy: 0.8, range: 150, bulletSpeed: 12, color: 'green', cost: 100, unlocked: false, ability: 'Piercing Arrow' , width:8, height:3},
    { name: 'Pistol', damage: 15, reloadTime: 1.0, accuracy: 0.9, range: 120, bulletSpeed: 15, color: 'brown', cost: 70, unlocked: true, ability: 'Basic Shooting' , width:6, height:2},
    { name: 'Rifle', damage: 25, reloadTime: 0.8, accuracy: 0.9, range: 200, bulletSpeed: 20, color: 'purple', cost: 150, unlocked: false, ability: 'Long Range' , width:12, height:3},
    { name: 'Laser', damage: 35, reloadTime: 1.5, accuracy: 0.85, range: 100, bulletSpeed: 18, color: 'orange', cost: 80, unlocked: false, ability: 'Piercing Damage' , width:15, height:4},
    { name: 'Shotgun', damage: 8, reloadTime: 1.2, accuracy: 0.6, range: 80, bulletSpeed: 12, color: 'red', cost: 180, unlocked: true, ability: 'Spread Shot' , width:4, height:2},
    { name: 'Bomb', damage: 50, reloadTime: 3.0, accuracy: 0.7, range: 100, bulletSpeed: 8, color: 'black', cost: 200, unlocked: true, ability: 'Explosion' , width:18, height:18},
    { name: 'Machinegun', damage: 8, reloadTime: 0.08, accuracy: 0.7, range: 250, bulletSpeed: 25, color: 'yellow', cost: 200, unlocked: false, ability: 'Rapid Fire' , width:3, height:2}
];
const enemyTypes = [
    { name:"none", speed: 0, color: 'rgba(0,0,0,0)', health:0, damage: 0, spawnChance: 0.0, money: 0 , size: 0},
    { name:"starter", speed: 2, color: 'red', health:15, damage: 3, spawnChance: 0.5, money: 5 , size: 20},
    { name:"easy", speed: 2, color: 'green', health: 20, damage: 10, spawnChance: 0.4, money: 10 , size: 30},
    { name:"basic", speed: 4, color: 'blue', health: 30, damage: 15, spawnChance: 0.3, money: 20 , size: 25},
    { name:"speedy", speed: 2, color: 'yellow', health: 15, damage: 10, spawnChance: 0.2, money: 5 , size: 15},
    { name:"normal", speed: 3, color: 'purple', health: 40, damage: 15, spawnChance: 0.2, money: 10 , size: 30},
    { name:"hard", speed: 1, color: 'gray', health: 60, damage: 20, spawnChance: 0.1, money: 20 , size: 40}
];
function rand(min, max) { return Math.floor(Math.random() * (max - min) ) + min;}
function switchWeapon(index) {
    if (weapons[index].unlocked) {
        currentWeaponIndex = index;
        const currentWeapon = weapons[currentWeaponIndex];
        player.style.backgroundColor = currentWeapon.color;
    }
}

// Random direction for bullet spread
function randomDirection(angle, spread = 0.1) {
    return angle + (Math.random() - 0.5) * spread;
}

// Random bullet size variation
function randomBulletSize(baseSize = 10, variation = 5) {
    return baseSize + Math.random() * variation - variation / 2;
}
function pause() {
    gamePaused = !gamePaused;
}
// Shotgun shooting logic
function shotgunShoot() {
    let bulNum = 6;
    const angle = randomDirection(Math.PI / 4 * (i - 2));

    const currentWeapon = weapons[currentWeaponIndex];
    for (let i = 0; i < bulNum; i++) {
        const bullet = document.createElement('div');
        bullet.classList.add('bullet');
        bullet.style.backgroundColor = currentWeapon.color;
        bullet.style.width = `${currentWeapon.width}px`;
        bullet.style.height = `${currentWeapon.height}px`;
        bullet.style.left = `${player.offsetLeft + player.offsetWidth / 2}px`;
        bullet.style.top = `${player.offsetTop + player.offsetHeight / 2}px`;
        gameContainer.appendChild(bullet);
        const bulletSpeed = currentWeapon.bulletSpeed;
        const bulletInterval = setInterval(() => {
            bullet.style.left = `${bullet.offsetLeft + bulletSpeed * Math.cos(angle)}px`;
            bullet.style.top = `${bullet.offsetTop + bulletSpeed * Math.sin(angle)}px`;

            enemies.forEach((enemy, index) => {
                if (bullet.getBoundingClientRect().left > enemy.getBoundingClientRect().left &&
                    bullet.getBoundingClientRect().left < enemy.getBoundingClientRect().right &&
                    bullet.getBoundingClientRect().top > enemy.getBoundingClientRect().top &&
                    bullet.getBoundingClientRect().top < enemy.getBoundingClientRect().bottom) {

                    enemy.health -= currentWeapon.damage;
                    const healthBar = enemy.querySelector('.health-bar');
                    const healthPercent = (enemy.health / (enemyTypes[0].health + level * 10)) * 100;
                    healthBar.style.width = `${Math.max(0, healthPercent)}%`;
                    healthBar.style.backgroundColor = enemy.health > 50 ? 'limegreen' : 'red';

                    if (enemy.health <= 0) {
                        score += 10;
                        money += enemy.money;
                        scoreDisplay.textContent = `Score: ${score}`;
                        moneyDisplay.textContent = `Money: $${money}`;
                        enemyContainer.removeChild(enemy);
                        enemies.splice(index, 1);
                    }
                    bullet.remove();
                    clearInterval(bulletInterval);
                }
            });

            if (bullet.offsetLeft > 800 || bullet.offsetTop > 400 || bullet.offsetTop < 0) {
                bullet.remove();
                clearInterval(bulletInterval);
            }
        }, 20);
    }
}

// Bomb shooting logic
function bombShoot() {
    const currentWeapon = weapons[currentWeaponIndex];
    const bomb = document.createElement('div');
    bomb.classList.add('bullet');
    bomb.style.backgroundColor = currentWeapon.color;
    bomb.style.width = `${currentWeapon.width}px`;
    bomb.style.height = `${currentWeapon.height}px`;
    bomb.style.left = `${player.offsetLeft + player.offsetWidth / 2}px`;
    bomb.style.top = `${player.offsetTop + player.offsetHeight / 2}px`;

    gameContainer.appendChild(bomb);

    const bombSpeed = currentWeapon.bulletSpeed;
    const bombInterval = setInterval(() => {
        bomb.style.left = `${bomb.offsetLeft + bombSpeed}px`;

        enemies.forEach((enemy, index) => {
            if (bomb.getBoundingClientRect().left > enemy.getBoundingClientRect().left &&
                bomb.getBoundingClientRect().left < enemy.getBoundingClientRect().right &&
                bomb.getBoundingClientRect().top > enemy.getBoundingClientRect().top &&
                bomb.getBoundingClientRect().top < enemy.getBoundingClientRect().bottom) {

                // Trigger explosion
                bomb.remove();
                clearInterval(bombInterval);
                explode(bomb.offsetLeft, bomb.offsetTop);
            }
        });

        if (bomb.offsetLeft > 800) {
            bomb.remove();
            clearInterval(bombInterval);
        }
    }, 20);
}

function explode(x, y) {
    const explosion = document.createElement('div');
    explosion.style.position = 'absolute';
    explosion.style.width = `${weapons[6].range}px`;
    explosion.style.height = `${weapons[6].range}px`;
    explosion.style.borderRadius = '50%';
    explosion.style.backgroundColor = 'rgba(255, 0, 0, 0.5)';
    explosion.style.left = `${x}px`;
    explosion.style.top = `${y}px`;

    gameContainer.appendChild(explosion);

    enemies.forEach((enemy, index) => {
        if (Math.abs(enemy.offsetLeft - x) < 50 && Math.abs(enemy.offsetTop - y) < 50) {
            enemy.health -= weapons[currentWeaponIndex].damage * 2; // Double damage for bomb
            const healthBar = enemy.querySelector('.health-bar');
            const healthPercent = (enemy.health / (enemyTypes[0].health + level * 10)) * 100;
            healthBar.style.width = `${Math.max(0, healthPercent)}%`;

            if (enemy.health <= 0) {
                score += 10;
                money += enemy.money;
                scoreDisplay.textContent = `Score: ${score}`;
                moneyDisplay.textContent = `Money: $${money}`;
                enemyContainer.removeChild(enemy);
                enemies.splice(index, 1);
            }
        }
    });

    setTimeout(() => explosion.remove(), 300);
}

// General shooting logic (handles all weapons)
function shoot() {
    if (!canShoot || gamePaused) return;
    canShoot = false;

    const currentWeapon = weapons[currentWeaponIndex];

    if (currentWeapon.name === 'Shotgun') {
        shotgunShoot();
    } else if (currentWeapon.name === 'Bomb') {
        bombShoot();
    } else {
        basicShoot();
    }

    setTimeout(() => {
        canShoot = true;
    }, currentWeapon.reloadTime * 1000);
}

function basicShoot() {
    const currentWeapon = weapons[currentWeaponIndex];
    const bullet = document.createElement('div');
    bullet.classList.add('bullet');
    bullet.style.backgroundColor = currentWeapon.color;
    bullet.style.width = `${currentWeapon.width}px`;
    bullet.style.height = `${currentWeapon.height}px`;
    bullet.style.left = `${player.offsetLeft + player.offsetWidth / 2}px`;
    bullet.style.top = `${player.offsetTop + player.offsetHeight / 2}px`;

    gameContainer.appendChild(bullet);

    const bulletSpeed = currentWeapon.bulletSpeed;
    const bulletInterval = setInterval(() => {
        bullet.style.left = `${bullet.offsetLeft + bulletSpeed}px`;

        enemies.forEach((enemy, index) => {
            if (bullet.getBoundingClientRect().left > enemy.getBoundingClientRect().left &&
                bullet.getBoundingClientRect().left < enemy.getBoundingClientRect().right &&
                bullet.getBoundingClientRect().top > enemy.getBoundingClientRect().top &&
                bullet.getBoundingClientRect().top < enemy.getBoundingClientRect().bottom) {

                enemy.health -= currentWeapon.damage;
                bullet.remove();
                clearInterval(bulletInterval);
            }
        });

        if (bullet.offsetLeft > 800) {
            bullet.remove();
            clearInterval(bulletInterval);
        }
    }, 20);
}

function movePlayer() {
    document.addEventListener('keydown', (e) => {
        if (!gamePaused) {
            if (e.key === 'ArrowUp' && player.offsetTop > 0) {
                player.style.top = `${player.offsetTop - playerSpeed}px`;
            }
            if (e.key === 'ArrowDown' && player.offsetTop < 370) {
                player.style.top = `${player.offsetTop + playerSpeed}px`;
            }
        }
    });
}

function moveEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.style.left = `${enemy.offsetLeft - enemy.speed}px`;

        if (enemy.offsetLeft < 0) {
            baseHealth -= enemy.damage;
            baseHealthDisplay.textContent = `Base Health: ${baseHealth}`;
            enemyContainer.removeChild(enemy);
            enemies.splice(index, 1);
            if (baseHealth <= 0) {
                endGame();
            }
        }
    });
}

function increaseLevel() {
    level++;
    levelDisplay.textContent = `Level: ${level}`;
    if (level === 2) weapons[4].unlocked = true;
    if (level === 3) weapons[1].unlocked = true;
    if (level === 4) weapons[3].unlocked = true;
    if (level === 5) weapons[5].unlocked = true;
    if (level === 6) weapons[6].unlocked = true;
    if (level === 7) weapons[7].unlocked = true;
    updateWeaponTable();
}

function updateWeaponTable() {
    for (let i = 0; i < weapons.length; i++) {
        const status = weapons[i].unlocked ? "Unlocked" : "Locked";
        const weaponCell = document.getElementById(`weapon-${i + 1}`);
        weaponCell.innerHTML = `${status}<br>Speed: ${weapons[i].bulletSpeed}<br>Ability: ${weapons[i].ability}`;
    }
}

function endGame() {
    localStorage.setItem('finalScore', score);
    localStorage.setItem('finalLevel', level);
    window.location.href = 'end.html';
}

function spawnEnemy() {
    let enemyType = enemyTypes.find(e => Math.random() < e.spawnChance/1000 + level * 0.05);
    if (!enemyType) enemyType = enemyTypes[0];

    const enemy = document.createElement('div');
    enemy.classList.add('enemy');
    enemy.style.top = `${Math.random() * 370}px`;
    enemy.style.left = `${800 + Math.random() * 50}px`;
    enemy.style.backgroundColor = enemyType.color;

    // Circular shape with inner health bar
    enemy.style.width = `${enemyType.size}px`;
    enemy.style.height = `${enemyType.size}px`;
    enemy.style.borderRadius = '50%';
    enemy.innerHTML = `<div class="health-bar"></div>`;

    const healthBar = enemy.querySelector('.health-bar');
    healthBar.style.width = `${enemyType.size * 0.8}px`; // make the health bar width less than the enemy size
    healthBar.style.height = '5px';
    healthBar.style.position = 'absolute';
    healthBar.style.top = '50%';
    healthBar.style.left = '10%';
    healthBar.style.transform = 'translateY(-50%)';
    healthBar.style.backgroundColor = 'limegreen';

    enemy.health = enemyType.health + level * 10;
    enemy.speed = enemyType.speed + level * 0.2;
    enemy.damage = enemyType.damage;
    enemy.money = enemyType.money;

    enemies.push(enemy);
    enemyContainer.appendChild(enemy);
}

function drawEnemies() {
    enemies.forEach((enemy, index) => {
        const healthBar = enemy.querySelector('.health-bar');
        const healthPercent = (enemy.health / (enemyTypes[0].health + level * 10)) * 100;
        healthBar.style.width = `${Math.max(0, healthPercent) * enemy.offsetWidth * 0.8 / 100}px`;
        healthBar.style.backgroundColor = enemy.health > 50 ? 'limegreen' : 'red';

        if (enemy.health < 1) {
            score += 10;
            money += enemy.money;
            scoreDisplay.textContent = `Score: ${score}`;
            moneyDisplay.textContent = `Money: $${money}`;
            enemyContainer.removeChild(enemy);
            enemies.splice(index, 1);
        }
    });
}

function moveEnemies() {
    enemies.forEach((enemy, index) => {
        enemy.style.left = `${enemy.offsetLeft - enemy.speed}px`;

        if (enemy.offsetLeft < 0) {
            baseHealth -= enemy.damage;
            baseHealthDisplay.textContent = `Base Health: ${baseHealth}`;
            enemyContainer.removeChild(enemy);
            enemies.splice(index, 1);
            if (baseHealth <= 0) {
                endGame();
            }
        }
    });
}

function initGame() {
    movePlayer();

    document.addEventListener('keydown', (e) => {
        const key = parseInt(e.key);
        if (key >= 1 && key <= 8) switchWeapon(key - 1);
        if (e.key === 'Shift') shoot();
        if (e.key === 'p') pause();
        if (e.key === ' ') location.reload();
    });

    setInterval(() => {
        if (!gamePaused) {
            moveEnemies();
            drawEnemies(); // call drawEnemies every frame
            if(rand(1, 10000)<spawnRate) spawnEnemy();
            if (score >= level * 50) increaseLevel();
        }
    }, framerate);

    updateWeaponTable();
}

initGame();

