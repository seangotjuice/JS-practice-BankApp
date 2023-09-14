'use strict';

///////////////////////////////////////
// Modal window

const modal = document.querySelector('.modal');
const overlay = document.querySelector('.overlay');
const btnCloseModal = document.querySelector('.btn--close-modal');
const btnsOpenModal = document.querySelectorAll('.btn--show-modal');
const btnScrollTo = document.querySelector('.btn--scroll-to');
const section1 = document.querySelector('#section--1');
const nav = document.querySelector('.nav');
const tabs = document.querySelectorAll('.operations__tab');
const tabsContainer = document.querySelector('.operations__tab-container');
const tabsContent = document.querySelectorAll('.operations__content');

const openModal = function (e) {
  // 防止scroll到top
  e.preventDefault();
  modal.classList.remove('hidden');
  overlay.classList.remove('hidden');
};

const closeModal = function () {
  modal.classList.add('hidden');
  overlay.classList.add('hidden');
};

btnsOpenModal.forEach(btn => btn.addEventListener('click', openModal));

btnCloseModal.addEventListener('click', closeModal);
overlay.addEventListener('click', closeModal);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape' && !modal.classList.contains('hidden')) {
    closeModal();
  }
});

//////////////////////////////////////
// scrolling

btnScrollTo.addEventListener('click', function (e) {
  const s1coords = section1.getBoundingClientRect();
  console.log(s1coords); // 顯示跟view的距離

  console.log(e.target.getBoundingClientRect()); // 顯示跟view的距離 隨著當下滑到的地方去取位置
  console.log('Current Scroll (X/Y)', window.pageXOffset, window.pageYOffset); // 顯示和最初位置的距離滑了多少

  console.log(
    'height/width viewpoint',
    document.documentElement.clientHeight,
    document.documentElement.clientWidth
  ); // 顯示viewport大小

  // // scrolling
  // window.scrollTo(
  //   s1coords.left + window.pageXOffset,
  //   s1coords.top + window.pageYOffset
  // );

  // // old school way
  // window.scrollTo({
  //   left: s1coords.left + window.pageXOffset,
  //   top: s1coords.top + window.pageYOffset,
  //   behavior: 'smooth',
  // });

  // best way but in modern browsers
  section1.scrollIntoView({
    behavior: 'smooth',
  });
});

//////////////////////////////////////
// Page navigation

// 以下沒有問題 但是如果按鈕有一萬個，那每一個都要掛一個函式會很沒效率
// document.querySelectorAll('.nav__link').forEach(function (el) {
//   el.addEventListener('click', function (e) {
//     e.preventDefault(); //href anchor 會直接去抓同一個anchor 名字的id（自動往下滑）
//     // scroll smooth
//     const id = this.getAttribute('href'); //我想要拿被點擊的按鈕的href 值
//     console.log(id);
//     document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
//   });
// });

// event delegation （掛監聽器在容器上，反正被打的人會在bubble up 做這個函式）
document.querySelector('.nav__links').addEventListener('click', function (e) {
  e.preventDefault();
  console.log(e.target);
  if (e.target.classList.contains('nav__link')) {
    const id = e.target.getAttribute('href'); //我想要拿被點擊的按鈕的href 值
    console.log(id);
    document.querySelector(id).scrollIntoView({ behavior: 'smooth' });
  }
});

// Tabbed component

// tabs.forEach(t => t.addEventListener('click', () => console.log('tab'))); 不要這樣用 會降低效率

// 用Event Delegation
tabsContainer.addEventListener('click', function (e) {
  // 重要：點擊span,選到btn，點擊btn,選到自己btn
  const clicked = e.target.closest('.operations__tab');
  // console.log(clicked);

  // Guard clause
  // 解決：若點擊到容器 會找不到父層叫做operations__tab的，因此clicked 變成 null
  if (!clicked) return;

  // remove active classes
  tabs.forEach(t => t.classList.remove('operations__tab--active'));
  tabsContent.forEach(c => c.classList.remove('operations__content--active'));

  // Active tab
  //只掛上被點擊的tab active
  clicked.classList.add('operations__tab--active');

  // Active content area
  // console.log(clicked.dataset.tab); // 檢查這是否給我data-tab數字
  document
    // 點擊到誰就選誰的content內容，並將他active
    .querySelector(`.operations__content--${clicked.dataset.tab}`)
    .classList.add('operations__content--active');
});

// Menu fade animation

const handleHover = function (o) {
  return function (e) {
    if (e.target.classList.contains('nav__link')) {
      const link = e.target;
      const siblings = link.closest('.nav').querySelectorAll('.nav__link');
      const logo = link.closest('.nav').querySelector('img');

      siblings.forEach(el => {
        if (el !== link) el.style.opacity = o;
      });
      logo.style.opacity = o;
    }
  };
};

// you can log the handleHover(0.1) to see that it returns a function which  // has access to the argument(opacity value) passed to handleHover() due to   // closures

nav.addEventListener('mouseover', handleHover(0.5));
nav.addEventListener('mouseout', handleHover(1));

// sticky navigation
const initialCoords = section1.getBoundingClientRect();
// console.log(initialCoords); // 取得“現在視窗”他離viewpoint距離 注意這個距離會隨著瀏覽器大小(viewport不同, 所以不能用hard code 直接寫死)

// scroll event在window上 不是document
window.addEventListener('scroll', function () {
  // console.log(window.scrollY); //每一次scroll時，都印一次Ｙ軸的位置(最上方為0)
  // when will the nav bar becomes sticky?
  if (window.scrollY > initialCoords.top) nav.classList.add('sticky');
  else nav.classList.remove('sticky');
});

// // sticky navigation: intersection observer API
// const obsCallback = function (entries, observer) {
//   // entries: an array of the threshold entries
//   entries.forEach(entry => console.log(entry));
// };
// const obsOptions = {
//   // need a root property
//   // target element (section1)要intersect root
//   root: null, // intersect the whole VIEWPORT
//   // threshold: 0.1, // 臨界點：數字越小越敏感（進到/離開 viewport一點就執行），這裡表示：每當target在viewport at 10%, 會叫callback function

//   threshold: [0, 0.2], // 也可以用陣列表示多個進出臨界點, 0代表一進來或一出去就執行
// };
// const observer = new IntersectionObserver(obsCallback, obsOptions);
// observer.observe(section1);

// --------------sticky nav bar--------------
const header = document.querySelector('.header');
const navHeight = nav.getBoundingClientRect().height; //拿nav的高度
const stickyNav = function (entries) {
  const [entry] = entries; // same as writing entries[0]
  // console.log(entry); // 顯示

  if (!entry.isIntersecting) nav.classList.add('sticky');
  else nav.classList.remove('.sticky');
};
const headerObserver = new IntersectionObserver(stickyNav, {
  root: null,
  threshold: 0,
  rootMargin: `-${navHeight}px`, // MUST to be pixels !?!?
});
headerObserver.observe(header);

// --------------reveal sections--------------
const allSections = document.querySelectorAll('.section');
const revealSection = function (entries, observer) {
  const [entry] = entries;
  // console.log(entry); // 滑到section2 時，打開來看target ->className: section--hidden , id: section2

  // 第一次整理頁面：section1有一個問題 不管有沒有intersect 就會直接叫一次callback fn，也就會被remove掉class
  // console.log(entry.target); // <section>發現hidden已經被remove掉，因此我要設定當isIntersecting = true才做後續

  if (!entry.isIntersecting) return;
  entry.target.classList.remove('section--hidden');
  // 當全部畫面都顯示完了，不用再observe-> unobserve
  observer.unobserve(entry.target);
  // console.log(entry.target); // <section>
};
const sectionObserver = new IntersectionObserver(revealSection, {
  root: null,
  threshold: 0.15,
});
allSections.forEach(function (section) {
  sectionObserver.observe(section);
  section.classList.add('section--hidden');
});

// --------------Lazy loading images--------------
// 重要！選取包含data-src的property的img
const imgTargets = document.querySelectorAll('img[data-src]');
const loadImg = function (ent, obs) {
  const [entry] = ent;
  console.log(entry);

  if (!entry.isIntersecting) return;

  // Replace src with data-src
  entry.target.src = entry.target.dataset.src;
  entry.target.classList.remove('lazy-img');

  // 在後台完成img load後 ...可以在img上監聽load事件！
  entry.target.addEventListener('load', function () {
    entry.target.classList.remove('lazy-img');
  });

  obs.unobserve(entry.target);
};
const imgObserver = new IntersectionObserver(loadImg, {
  root: null,
  threshold: 0,
  rootMargin: '200px', // 比threshold抵達前 早200呼叫callback
});
imgTargets.forEach(img => imgObserver.observe(img));

// --------------Slider--------------
const slider = function () {
  const slides = document.querySelectorAll('.slide');
  const btnLeft = document.querySelector('.slider__btn--left');
  const btnRight = document.querySelector('.slider__btn--right');
  const dotContainer = document.querySelector('.dots');

  let curSlide = 0; // 初始以0為第一張
  const maxSlide = slides.length; // 總共幾個slide

  // // 這邊只是方便我看清楚現在做到哪 （以下是inline寫法）
  // const slider = document.querySelector('.slider');
  // slider.style.transform = 'scale(0.2) translateX(-800px)'; // 縮小 並往左移800px
  // slider.style.overflow = 'visible'; //複寫css.style的樣式 （inline優先）

  // functions
  const createDots = function () {
    // 這邊我只是要拿slide張數而已
    slides.forEach(function (_, i) {
      // 好方便！！插入html，記起來這樣寫
      dotContainer.insertAdjacentHTML(
        'beforeend',
        `<button class="dots__dot" data-slide="${i}"></button>`
      );
    });
  };

  const activateDot = function (slide) {
    // 先 DE-activate dots
    document
      .querySelectorAll('.dots__dot')
      .forEach(dot => dot.classList.remove('dots__dot--active'));

    // 再加上 active
    document
      .querySelector(`.dots__dot[data-slide="${slide}"]`)
      .classList.add('dots__dot--active');
  };

  const goToSlide = function (slide) {
    slides.forEach(
      // 改變translateX 的百分比 0%, 100%, 200%, 300%,
      (s, i) => (s.style.transform = `translateX(${100 * (i - slide)}%)`)
    );
  };

  // 初始化頁面
  const init = function () {
    goToSlide(0);
    createDots();
    activateDot(0);
  };
  init();

  const nextSlide = function () {
    if (curSlide === maxSlide - 1) {
      curSlide = 0;
    } else {
      curSlide++;
    }
    goToSlide(curSlide);
    activateDot(curSlide);
  };

  const prevSlide = function () {
    if (curSlide === 0) {
      curSlide = maxSlide - 1;
    } else {
      curSlide--;
    }
    goToSlide(curSlide);
    activateDot(curSlide);
  };

  // Event handlers
  btnRight.addEventListener('click', nextSlide);
  btnLeft.addEventListener('click', prevSlide);

  // 左右鍵 （記得掛在document)
  document.addEventListener('keydown', function (e) {
    console.log(e); //檢查
    if (e.key === 'ArrowLeft') prevSlide();
    e.key === 'ArrowRight' && nextSlide(); // shortcircuiting 寫法
  });

  dotContainer.addEventListener('click', function (e) {
    if (e.target.classList.contains('dots__dot')) {
      // const  slide  = e.target.dataset.slide; destructure變成...
      const { slide } = e.target.dataset;
      goToSlide(slide);
      activateDot(curSlide);
    }
  });
};
// 把這個功能整個包在一起呼叫 避免污染code
slider();
//////////////////////////////////////
//////////////////////////////////////
//////////////////////////////////////

//
// 當html, js被載完
document.addEventListener('DOMContentLoaded', function (e) {
  console.log('HTML parsed and DOM tree built!', e);
});
// img, css...外部資源被載完
window.addEventListener('load', function (e) {
  console.log('Page fully loaded', e);
});
// 若有互動過，則關閉頁面前會fire pop up訊息
window.addEventListener('beforeunload', function (e) {
  e.preventDefault(); //for 非 chrome
  console.log(e);
  e.returnValue = '';
});
// // selecting creating deleting

// console.log(document.documentElement); //顯示整個html文件
// console.log(document.head);
// console.log(document.body);

// const header = document.querySelector('.header');
// const allSections = document.querySelectorAll('.section');
// console.log(allSections); // 跟下面不同，nodelist異動並不會同步更新

// document.getElementById('section--1');
// const allButtons = document.getElementsByTagName('button');
// console.log(allButtons); // return HTML Collection 意思是我有其他DOM操做改變html的時候他這邊會自動更新

// console.log(document.getElementsByClassName('btn')); // 也會有html collection

// // Creating and inserting elements
// // .insertAdjacentHTML
// // .createElement

// const message = document.createElement('div');
// message.classList.add('cookie-message');
// message.innerHTML =
//   'We use cookies for improved functionality and analytics. <button class ="btn btn--close-cookie">Got it!</button>';

// // header.prepend(message);
// // element是一個unique的必且活動的 隨時可以再移動但只能出現一個地方
// header.append(message);
// // 那如果我想要讓這個element複製出現在很多地方怎麼做
// // header.append(message.cloneNode(true));
// // 還有before, after可以insert element

// // Delete elements
// document
//   .querySelector('.btn--close-cookie')
//   .addEventListener('click', function () {
//     // 記新方法！比起dom遍歷節點還方便多了！
//     message.remove();
//     // message.parentElement.removeChild(message)
//   });

// // Styles
// message.style.backgroundColor = '#37373d';
// message.style.width = '120%'; // 屬於inline style(在html的class裡面)

// console.log(message.style.height); // 舉例這樣選是選css裡面的(hidden inside class) // 那就無法選到
// console.log(message.style.backgroundColor); // 可以選到

// console.log(getComputedStyle(message)); //顯示在節點上的所有style
// console.log(getComputedStyle(message).color); //這時就可以選擇任何元素附帶的屬性（包括沒有在css的）

// message.style.height =
//   Number.parseFloat(getComputedStyle(message).height, 10) + 30 + 'px';

// // call css variables
// // (property selected , value want to set)
// document.documentElement.style.setProperty('--color--primary', 'orangered');

// // attributes
// const logo = document.querySelector('.nav__logo');
// console.log(logo.alt);
// console.log(logo.className);

// logo.alt = 'Beautiful minimalist logo'; // 直接設他的attribute

// // non-standard attributes
// console.log(logo.designer); // undefined
// console.log(logo.getAttribute('designer')); //Jonas
// logo.setAttribute('company', 'Bankist'); //新增一個company attribute

// // ACTUAL 的URL
// console.log(logo.src); //http://127.0.0.1:5500/img/logo.png
// // 重要！reletavie 的url(檔案位置)
// console.log(logo.getAttribute('src'));

// const link = document.querySelector('.nav__link--btn');
// console.log(link.href); //http://127.0.0.1:5500/#
// console.log(link.getAttribute('href')); //#

// // Data Attributes (data-*)
// // 注意！！dataset後面的名字要用camel case !
// // 下面再html長這樣 data-version-number = "3.0"
// console.log(logo.dataset.versionNumber); // 3.0

// // Classes
// // add, remove, toggle, contains(not includes!!)....

// // don't use!!! 因為會覆寫原本的classes，而且只能選一個
// logo.className = 'jonas';

/////////////////////////////////
// // scrolling
// const btnScrollTo = document.querySelector('.btn--scroll-to');
// const section1 = document.querySelector('#section--1');

// btnScrollTo.addEventListener('click', function (e) {
//   const s1coords = section1.getBoundingClientRect();
//   console.log(s1coords); // 顯示跟view的距離

//   console.log(e.target.getBoundingClientRect()); // 顯示跟view的距離 隨著當下滑到的地方去取位置
//   console.log('Current Scroll (X/Y)', window.pageXOffset, window.pageYOffset); // 顯示和最初位置的距離滑了多少

//   console.log(
//     'height/width viewpoint',
//     document.documentElement.clientHeight,
//     document.documentElement.clientWidth
//   ); // 顯示viewport大小

//   // // scrolling
//   // window.scrollTo(
//   //   s1coords.left + window.pageXOffset,
//   //   s1coords.top + window.pageYOffset
//   // );

//   // // old school way
//   // window.scrollTo({
//   //   left: s1coords.left + window.pageXOffset,
//   //   top: s1coords.top + window.pageYOffset,
//   //   behavior: 'smooth',
//   // });

//   // best way but in modern browsers
//   section1.scrollIntoView({
//     behavior: 'smooth',
//   });
// });
/////////////////////////////
// // event

// const h1 = document.querySelector('h1');
// const alertH1 = function (e) {
//   alert('addEventListner: you are reading the heading');
//   // 只發生一次的事件 就刪除他
//   h1.removeEventListener('mouseenter', alertH1);
// };
// h1.addEventListener('mouseenter', alertH1);
// setTimeout(() => h1.removeEventListener('mouseenter', alertH1, 3000)); // 3秒後就移除

// // // oldschool way
// // h1.onmouseenter = function (e) {
// //   alert('addEventListner: you are reading the heading');
// // };

// // 第一個使用addEventListener的好處是：可以在同一個監聽對象上添加不同函式
// // 第二個好處是，可以隨時移除監聽器
// /////////////////////////////

// const h1 = document.querySelector('h1');

// // ------going downwards : child------
// // 我可以在一個節點內，選取他的子節點 class叫highlight的
// console.log(h1.querySelectorAll('.highlight'));
// // 所有子節點
// console.log(h1.children); // HTMLCollection(3)[] (同步live的)
// // firstElementChild, lastElementChild

// // ------going upwards : parent------
// // querySeclectorAll 選所有下層; 反之，closest找所有上層
// h1.closest('.header').style.background = 'var(--gradient-secondary)'; //所有header上面的背景都改了
// h1.closest('h1').style.background = 'var(--gradient-primary)'; // 選自己
// // 這裡CSS是用css variable (先寫在root告訴我這個變數存什麼顏色)

// // going sideways : siblings
// console.log(h1.previousElementSibling);
// console.log(h1.nextElementSibling);

// // 上來再下來，可以拿我和周遭的所有節點
// console.log(h1.parentElement.children); //HTMLCollection(4)
// // 記得他不是一個真的array，因此我把他spread到array
// [...h1.parentElement.children].forEach(function (el) {
//   if (el !== h1) el.style.transform = 'scale(0.5)';
// }); // 選我之外的所有周遭節點
