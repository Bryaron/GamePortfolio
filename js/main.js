const SPRITE_WRAPPER_SELECTOR = '.c-character__sprite';
const SPRITE_DIRECTIONS = ['front', 'right', 'back', 'left'];
const SPRITESHEET_DIRECTION_CLASS = 'c-character__spritesheet--';

/**
 * Skill Class
 */
class Skill {
    constructor(data) {
        this.name = data.name;
        this.label = data.label || data.name;
        this.icon = data.icon || null;
        this.level = data.level; // 'basic', 'intermediate', 'advanced'
        this.equipped = Boolean(data.equipped);
    }

    /**
     * Equip skill
     */
    equip() {
        if (this.equipped) {
            return false;
        }
        this.equipped = true;
        console.log(`✓ "${this.label}" (${this.level}) equipado.`);
        return true;
    }

    /**
     * Unequip skill
     */
    unequip() {
        if (!this.equipped) {
            return false;
        }
        this.equipped = false;
        console.log(`✓ "${this.label}" desequipado.`);
        return true;
    }

    /**
     * Verify a skill is equipped
     */
    isEquipped() {
        return this.equipped;
    }

    /**
     * Skill information
     */
    getInfo() {
        return {
            name: this.name,
            label: this.label,
            level: this.level,
            equipped: this.equipped,
            icon: this.icon
        };
    }
}

/**
 * Project Class
 */
class Project {
    constructor(data) {
        this.title = data.title;
        this.tool = data.tool;
        this.img = data.img;
        this.categories = Array.isArray(data.categories) ? [...data.categories] : [];
        this.link = data.link;
    }

    /**
     * Project information
     */
    getInfo() {
        return {
            title: this.title,
            tool: this.tool,
            img: this.img,
            categories: this.categories,
            link: this.link
        };
    }

    /**
     * Verify if project has a specific category
     */
    hasCategory(category) {
        return this.categories.includes(category);
    }

    /**
     * Get categories as a comma-separated string
     */
    getCategoriesString() {
        return this.categories.join(', ');
    }
}

/**
 * Character Class
 */
class Character {
    constructor(data) {
        this.name = data.name;
        this.skills = data.skills.map(skillData => new Skill(skillData));
        this.bag = data.bag.map(projectData => new Project(projectData));
        this.stats = { ...data.stats };
        this.equippedSlots = new Array(6).fill(null);
        //Initialize equipped slots based on skills that are marked as equipped
        this._initializeEquippedSlots();
    }

    /**
     * Initialize equipped slots
     */
    _initializeEquippedSlots() {
        const equippedSkills = this.skills.filter(skill => skill.equipped);
    
        if (equippedSkills.length > 6) {
            console.warn(`${equippedSkills.length} skills equipadas, pero solo caben 6. Las últimas serán ignoradas.`);
        }
    
        this.equippedSlots = equippedSkills.slice(0, 6);
    }
    /**
     * Get character name
     */
    getName() {
        return this.name;
    }

    /**
     * Get skill by name
     */
    getSkillByName(skillName) {
        return this.skills.find(skill => skill.name === skillName);
    }

    /**
     * Get skill by icon filename (e.g., "csharp.svg")
     */
    getSkillByIconFilename(iconFilename) {
        return this.skills.find(skill => {
            if (!skill.icon) return false;
            return skill.icon.split('/').pop() === iconFilename;
        });
    }

    /**
     * Get skills by level ("basic", "intermediate", "advanced")
     */
    getSkillsByLevel(level) {
        return this.skills.filter(skill => skill.level === level);
    }

    /**
     * Get equipped skills (in slot order)
     */
    getEquippedSkills() {
        return this.equippedSlots.filter(slot => slot !== null);
    }

    /**
     * Verify if a skill is equipped in any slot
     */
    isSkillEquipped(skillName) {
        return this.equippedSlots.some(slot => slot && slot.name === skillName);
    }

    /**
     * Equip skill if not already equipped and if there's an empty slot
     */
    equipSkill(skillName) {
        const skill = this.getSkillByName(skillName);

        if (!skill) {
            console.warn(`Skill "${skillName}" no existe.`);
            return false;
        }

        if (skill.equipped) {
            console.log(`"${skill.label}" ya está equipada.`);
            return false;
        }

        // Search for the first empty slot (null)
        const emptySlotIndex = this.equippedSlots.findIndex(slot => slot === null);

        if (emptySlotIndex === -1) {
            console.warn('No puedes equipar más de 6 skills (todos los slots están ocupados).');
            return false;
        }

        // Assign the skill to the empty slot and mark it as equipped
        this.equippedSlots[emptySlotIndex] = skill;
        skill.equipped = true;
        
        console.log(`"${skill.label}" equipada en slot ${emptySlotIndex}.`);
        console.log('Slots actuales:', this.equippedSlots.map(s => s ? s.label : 'VACÍO'));
        
        return true;
    }

    /**
     * Unequip skill
     * Leave slot empty (null)
     */
    unequipSkill(skillName) {
        const skill = this.getSkillByName(skillName);
        
        if (!skill) {
            console.warn(`Skill "${skillName}" no existe.`);
            return false;
        }

        // Find slot where the skill is equipped
        const slotIndex = this.equippedSlots.findIndex(slot => slot && slot.name === skillName);

        if (slotIndex === -1) {
            console.warn(`Skill "${skillName}" no está equipada.`);
            return false;
        }

        // Empty the slot (set to null)
        this.equippedSlots[slotIndex] = null;
        skill.equipped = false;
        
        console.log(`✓ "${skill.label}" desequipada del slot ${slotIndex}.`);
        console.log('Slots actuales:', this.equippedSlots.map(s => s ? s.label : 'VACÍO'));
        
        return true;
    }
    /**
     * Set character name (20 characters max)
     */
    updateName(name) {
        if (!name) {
            console.warn('Nombre de character inválido.');
            return false;
        } else if (name.length > 20) {
            console.warn('Nombre de character demasiado largo.');
            return false;
        } else {
            this.name = name;
            return true;
        }
    }

    /**
     * Update stat
     */
    updateStat(statName, value) {
        if (!(statName in this.stats)) {
            console.warn(`Stat "${statName}" no existe.`);
            return false;
        }

        this.stats[statName] = value;
        console.log(`Stat "${statName}" actualizado a ${value}`);
        return true;
    }

    /**
     * Get project from bag by title
     */
    getProjectFromBag(projectTitle) {
        return this.bag.find(project => project.title === projectTitle);
    }

    /**
     * Get all projects in the bag
     */
    getAllProjects() {
        return this.bag;
    }

    /**
     * Get projects by specific category
     */
    getProjectsByCategory(category) {
        return this.bag.filter(project => project.hasCategory(category));
    }

    /**
     * Add project to bag
     */
    addToBag(projectData) {
        const project = new Project(projectData);
        if (this.getProjectFromBag(project.title)) {
            console.log(`"${project.title}" ya está en la bag.`);
            return false;
        }

        this.bag.push(project);
        console.log(`✓ "${project.title}" añadido a la bag.`);
        return true;
    }

    /**
     * Remove project from bag by title
     */
    removeFromBag(projectTitle) {
        const index = this.bag.findIndex(project => project.title === projectTitle);
        
        if (index === -1) {
            console.warn(`"${projectTitle}" no encontrado en la bag.`);
            return false;
        }

        const removed = this.bag.splice(index, 1)[0];
        console.log(`✓ "${removed.title}" removido de la bag.`);
        return true;
    }

    /**
     * Get complete information about the character
     */
    getInfo() {
        return {
            name: this.name,
            skills: this.skills.map(s => s.getInfo()),
            equippedSlots: this.equippedSlots.map(s => s ? s.name : null),
            stats: this.stats,
            bag: this.bag.map(p => p.getInfo()),
            bagSize: this.bag.length
        };
    }
}

// Character instance (global)
let character;

/**
 * Load character data from JSON
 */
async function loadCharacterData() {
    try {
        const response = await fetch('data/character.json');
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const data = await response.json();
        character = new Character(data);
        console.log('✓ Character cargado desde JSON:', character);
        return true;
    } catch (error) {
        console.error('✗ Error cargando character.json:', error);
        return false;
    }
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadEventListeners);
} else {
    loadEventListeners();
}

/**
 * Startup function to load character data and initialize event listeners
 */
async function loadEventListeners() {
    const dataLoaded = await loadCharacterData();
    if (!dataLoaded) return;

    initCharacterAnimationToggle();
    initSkillsGrid();
    initProjectsBag();
    updateCharacterData();
}


/**
 * ===== SPRITE ANIMATION =====
 */

function getCurrentDirectionClass(spriteElement) {
    return SPRITE_DIRECTIONS.find((direction) => 
        spriteElement.classList.contains(`${SPRITESHEET_DIRECTION_CLASS}${direction}`)
    );
}

function getNextDirection(currentDirection) {
    const currentIndex = SPRITE_DIRECTIONS.indexOf(currentDirection);
    const nextIndex = currentIndex === -1 ? 0 : (currentIndex + 1) % SPRITE_DIRECTIONS.length;
    return SPRITE_DIRECTIONS[nextIndex];
}

function setSpriteDirection(spriteElement, direction) {
    SPRITE_DIRECTIONS.forEach((currentDirection) => {
        spriteElement.classList.toggle(
            `${SPRITESHEET_DIRECTION_CLASS}${currentDirection}`,
            currentDirection === direction
        );
    });
}

function handleCharacterClick(event) {
    const spriteElement = event.currentTarget.querySelector('.c-character__spritesheet');
    if (!spriteElement) return;

    const currentDirection = getCurrentDirectionClass(spriteElement);
    const nextDirection = getNextDirection(currentDirection);
    setSpriteDirection(spriteElement, nextDirection);
}

function initCharacterAnimationToggle() {
    const spriteWrapper = document.querySelector(SPRITE_WRAPPER_SELECTOR);
    if (!spriteWrapper) return;

    const spriteElement = spriteWrapper.querySelector('.c-character__spritesheet');
    if (spriteElement) {
        spriteElement.style.pointerEvents = 'none';
    }

    spriteWrapper.addEventListener('click', handleCharacterClick);
}

/**
 * ===== SKILLS GRID =====
 */

function getSkillFromItem(item) {
    const img = item.querySelector('img:not([src*="item_shadow"])');
    if (!img || !img.src) return null;

    const iconFilename = img.src.split('/').pop();
    return character.getSkillByIconFilename(iconFilename);
}

function handleSkillClick(event) {
    const skillItem = event.currentTarget;
    const skill = getSkillFromItem(skillItem);
    if (!skill) {
        console.warn('Skill inválida: elemento sin icono válido o sólo sombra.');
        return;
    }

    if (skill.equipped) {
        const unequipped = character.unequipSkill(skill.name);
        if (unequipped) {
            skillItem.classList.remove('c-item--filled');
            skillItem.classList.add('c-item--outline');
            updateCharacterData();
            updateItemInfoPanel(skill);
        }
    } else {
        const equipped = character.equipSkill(skill.name);
        if (equipped) {
            skillItem.classList.remove('c-item--outline');
            skillItem.classList.add('c-item--filled');
            updateCharacterData();
            updateItemInfoPanel(skill);
        }
    }
}

function initSkillsGrid() {
    // Initialize the skills grid based on character.skills data (DOM)

    const skillsGrid = document.querySelector('.c-grid-items');
    if (!skillsGrid) return;

    const allSkills = character.skills;
    clearContainer(skillsGrid); // Clear previous content

    // AUXILIAR FUNCTION: Create skill item element
    const createSkillItem = (skillData = null) => {
        const skillItem = document.createElement('div');
        skillItem.classList.add('c-item', 'c-item--outline', 'o-item-container');
        
        const iconSrc = skillData?.icon || 'assets/icons/items/item_empty.svg';
        const altText = skillData?.label || 'Empty Slot';

        skillItem.innerHTML = `
            <img src="${iconSrc}" alt="${altText}">
            <img src="assets/icons/items/item_shadow.svg" alt="">
        `;
        
        return skillItem;
    };

    // Calculate target grid size (multiple of 4)
    // If there is 5 skills, round up to 8 slots (2 rows of 4) etc.
    const targetSize = Math.ceil(allSkills.length / 4) * 4;
    // Secure a minimum of 4 slots to avoid rendering an empty grid
    const finalSize = Math.max(targetSize, 4); 
    console.log(`Skills: ${allSkills.length} | Target Grid Size: ${finalSize}`);

    // Render skills in the grid
    allSkills.forEach(skill => {
        skillsGrid.appendChild(createSkillItem(skill));
    });
    
    // Fill remaining slots with empty items to maintain grid structure

    const remainingSlots = finalSize - allSkills.length;
    
    if (remainingSlots > 0) {
        const fragment = document.createDocumentFragment();
        
        for (let i = 0; i < remainingSlots; i++) {
            fragment.appendChild(createSkillItem()); // Sin skillData = slot vacío
        }
        
        skillsGrid.appendChild(fragment);
    }

    console.log(`Total elementos renderizados: ${skillsGrid.children.length}`);

    // Add click event listeners to skill items and set initial equipped state
    
    const skillItems = skillsGrid.querySelectorAll('.c-item');
    let firstEquippedSkill = null;

    skillItems.forEach(item => {
        const skill = getSkillFromItem(item);
        
        if (!skill) {
            // Deshabilitar clicks en slots vacíos
            item.style.pointerEvents = 'none';
            return;
        }

        item.addEventListener('click', handleSkillClick);
        
        if (skill.equipped) {
            item.classList.remove('c-item--outline');
            item.classList.add('c-item--filled');
            if (!firstEquippedSkill) {
                firstEquippedSkill = skill;
            }
        }
    });

    if (firstEquippedSkill) {
        updateItemInfoPanel(firstEquippedSkill);
    }
}

/**
 * ===== SKILL PANEL =====
 */

function updateItemInfoPanel(skill) {
    if (!skill) return;

    const itemInfoHeader = document.querySelector('.c-item-info .c-item--filled');
    if (itemInfoHeader) {
        const iconImg = itemInfoHeader.querySelector('img:not([src*="item_shadow"])');
        if (iconImg && skill.icon) {
            iconImg.src = skill.icon;
        }
    }

    const titleEl = document.querySelector('.c-item-info__title');
    if (titleEl) {
        titleEl.textContent = skill.label;
    }

    const levelEl = document.querySelector('.c-item-info__level');
    if (levelEl && skill.level) {
        levelEl.textContent = skill.level.charAt(0).toUpperCase() + skill.level.slice(1);
    }

    const stateEl = document.querySelector('.c-item-info__state > p');
    if (stateEl) {
        stateEl.textContent = skill.equipped ? 'Equipped' : 'Unequipped';
    }

}

/**
 * ===== CHARACTER DATA =====
 */

function updateCharacterData() {
    
    const STAT_MAPPING = [
        'code',
        'draw',
        'gamedev',
        '3d'
    ];
    
    const statElements = document.querySelectorAll('.c-character__skill-stats .c-character__stat p');
    
    STAT_MAPPING.forEach((statKey, index) => {
        const element = statElements[index];

        if (element && character.stats.hasOwnProperty(statKey)) {
            element.textContent = character.stats[statKey];
        }
    });

    // Update character name
    const nameEl = document.querySelector('.c-character__name');
    if (nameEl) {
        nameEl.textContent = character.name;
    }

    // Update HP and SP
    const hpSpEl = document.querySelector('.c-character__stats p');
    if (hpSpEl) {
        hpSpEl.innerHTML = `HP ${character.stats.hp}/<span>50</span> SP ${character.stats.sp}/<span>50</span>`;
    }

    // Update equipped skills in the 6 slots
    const skillItemsSlots = document.querySelectorAll('.c-item-row .c-item img:not([src*="item_shadow"])');
    
    // Through the 6 skill slots, update the icon
    for (let i = 0; i < skillItemsSlots.length; i++) {
        const imgElement = skillItemsSlots[i];
        
        if (!imgElement) continue;

        // Get skill data for this slot (can be null if empty)
        const skillData = character.equippedSlots[i];
        
        if (skillData) {
            imgElement.src = skillData.icon;
        } else {
            imgElement.src = 'assets/icons/items/item_empty.svg';
        }
    }
}

/**
 * ===== PROJECTS BAG =====
 */

function initProjectsBag() {
    const projectsBag = document.querySelector('.c-projects-bag');
    if (!projectsBag) return;

    // Clear container before rendering
    clearContainer(projectsBag);
    // AUXILIAR FUNCTION: Render projects from bag 
    const createProjectCard = (projectData) => {
        const card = document.createElement('div');
        card.className = 'c-project-card o-project-card-container';

        const link = document.createElement('a');
        link.className = 'c-project-card__link o-project-card-link-container';
        link.href = projectData.link || '#';

        const img = document.createElement('img');
        img.className = 'c-project-card__image o-project-card-image-container';
        img.src = projectData.img;
        img.alt = projectData.title || '';
        link.appendChild(img);

        const info = document.createElement('div');
        info.className = 'c-project-card__info o-project-card-info-container';
        const categoriesMarkup = (projectData.categories || []).map(cat => `<div class="c-pill o-pill"><p>${cat}</p></div>`).join('');
        info.innerHTML = `
            <div class="c-project-card__titles o-project-card-titles-container">
                <p>${projectData.title || ''}</p>
                <p>${projectData.tool || ''}</p>
            </div>
            <div class="c-project-card__categories o-project-card-categories-container">
                ${categoriesMarkup}
            </div>
        `;

        card.appendChild(link);
        card.appendChild(info);

        return card;
    };

    const projects = character.getAllProjects ? character.getAllProjects() : (character.bag || []);
    projects.forEach(proj => {
        const data = typeof proj.getInfo === 'function' ? proj.getInfo() : proj;
        projectsBag.appendChild(createProjectCard(data));
    });
}

/**
 * ===== UTILITIES =====
 */

function clearContainer(container) {
    while(container.firstChild) {
        container.removeChild(container.firstChild);
    }
}
