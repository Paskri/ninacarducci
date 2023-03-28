class Caroussel {
    /** 
     * * @param{HTMLElement}element 
     * * @param{Object}options 
     * * @param{Object}options.slidesToScroll nombre d'éléments à faire défiler 
     * * @param{Object}options.slidesVisible nombre d'élements visibles dans un slide 
     * */ 
    constructor(element) {
      this.element = element;
      this.children = [].slice.call(element.children);
      this.container = this.createDivWithClass("carousel-container");
      this.container.setAttribute("id", "carousel-container");
      this.element.appendChild(this.container);
      this.items = this.children.map((child) => {
        let item = this.createDivWithClass("carousel-item");
        let itemImg = child.querySelector("img");
        let itemId = itemImg.getAttribute("id");
        item.setAttribute("id", itemId);
        itemImg.removeAttribute("id");
        item.appendChild(child);
        return item;
      });
      let offset = 1;
      this.items = [
        ...this.items.slice(this.items.length - offset).map((item) => {
          let newItem = item.cloneNode(true);
          let newItemId = newItem.getAttribute("id");
          newItem.setAttribute("id", newItemId + "b");
          return newItem;
        }),
        ...this.items,
        ...this.items.slice(0, offset).map((item) => {
          let newItem = item.cloneNode(true);
          let newItemId = newItem.getAttribute("id");
          newItem.setAttribute("id", newItemId + "b");
          return newItem;
        }),
      ];
      this.goToItem(offset, false);
      this.updateIndicators(offset);
      this.items.forEach((item) => this.container.appendChild(item));
      this.createNavigation();
      this.container.addEventListener("transitionend", this.resetInfinite.bind(this));
      this.indicators = document.querySelectorAll(".carousel-indicators button");
      this.indicators.forEach((indicator) => {
        this.dispatchMouseEvents(indicator);
        indicator.addEventListener("click", (e) => {
          e.stopPropagation();
          let slideTo = e.target.getAttribute("data-slide-to");
          this.goToItem(parseInt(slideTo));
          this.updateIndicators(parseInt(slideTo));
        });
      });
      this.timer = null;
      this.startTimer();
      this.container.addEventListener("mouseenter", this.stopTimer.bind(this));
      this.container.addEventListener("mouseleave", this.startTimer.bind(this));
      document.addEventListener("keydown", (e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          this.stopTimer();
          this.goToItem(this.currentItem + 1);
        }
      });
      document.addEventListener("keyup", (e) => {
        if (e.key === "ArrowLeft" || e.key === "ArrowRight") {
          this.startTimer();
          this.goToItem(this.currentItem - 1);
        }
      });
    }
    /** 
     * * Crée une div à partir d'une className * @param{string}className 
     * * @returns HTMLElement 
     * */ 
    createDivWithClass(className) {
      let div = document.createElement("div");
      div.setAttribute("class", className);
      return div;
    }
    /** 
     * * 
     * Place les event listeners sur les boutons de navigation previous et next 
     * */ createNavigation() {
      let prevButton = document.querySelector(".carousel-prev-icon");
      let nextButton = document.querySelector(".carousel-next-icon");
      let carouselPrev = document.querySelector(".carousel-prev");
      let carouselNext = document.querySelector(".carousel-next");
      this.dispatchMouseEvents(prevButton);
      this.dispatchMouseEvents(nextButton);
      this.dispatchMouseEvents(carouselPrev);
      this.dispatchMouseEvents(carouselNext);
      carouselPrev.addEventListener("click", (e) => {
        e.stopPropagation();
        this.prev(e);
      });
      carouselNext.addEventListener("click", (e) => {
        e.stopPropagation();
        this.next(e);
      });
    }
    /** 
     * * Défilement vers l'élément précédent 
     * */ prev() {
      this.goToItem(this.currentItem - 1);
      if (this.currentItem - 1 < 0) {
        this.updateIndicators(3);
      } else {
        this.updateIndicators(this.currentItem);
      }
    }
    /** 
     * * Défilement vers l'élément suivant 
     * */ next() {
      this.goToItem(this.currentItem + 1);
      if (this.currentItem + 1 > 4) {
        this.updateIndicators(1);
      } else {
        this.updateIndicators(this.currentItem);
      }
    }
    /** 
     * * Déplace le carousel vers l'élément ciblé 
     * * @param{number}index * @param{boolean}animation=true */ goToItem(index, animation = true) {
      let translateX = (index * -100) / this.items.length;
      if (translateX < -100) {
        translateX = -20;
        this.currentItem = 1;
      } else {
        if (animation === false) {
          this.container.style.transition = "none";
        }
        this.container.style.transform = "translate3d(" + translateX + "%, 0, 0)";
        this.container.offsetHeight;
        if (animation === false) {
          this.container.style.transition = "";
        }
        this.currentItem = index;
      }
    }
    /** 
     * * modifie l'indicateur actif en fonction du nouvel index 
     * */ updateIndicators(index) {
      let lastActive = document.querySelector(".carousel-indicators button.active");
      if (lastActive) {
        lastActive.removeAttribute("class");
      }
      let buttons = document.querySelectorAll(".carousel-indicators button");
      buttons.forEach((button) => {
        let slideTo = button.getAttribute("data-slide-to");
        if (parseInt(slideTo) === index) {
          button.setAttribute("class", "active");
        }
      });
    }
    /** 
     * * scrolle vers l'élément en début ou fin de chaine selon index 
     * */ resetInfinite() {
      if (this.currentItem === 4) {
        this.goToItem(1, false);
      }
      if (this.currentItem === 0) {
        this.goToItem(3, false);
      }
    }
    startTimer() {
      this.stopTimer();
      this.timer = setTimeout(() => {
        this.next();
        this.startTimer();
      }, 4000);
    }
    stopTimer() {
      clearTimeout(this.timer);
    }
    dispatchMouseEvents(element) {
      element.addEventListener("mouseenter", (e) => {
        this.container.dispatchEvent(new Event("mouseenter"));
      });
      element.addEventListener("mouseleave", (e) => {
        this.container.dispatchEvent(new Event("mouseleave"));
      });
    }
  }
  document.addEventListener("DOMContentLoaded", function () {
    new Caroussel(document.querySelector(".carousel-items"));
  });
  