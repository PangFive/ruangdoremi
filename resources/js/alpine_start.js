import Alpine from 'alpinejs'
import intersect from '@alpinejs/intersect'
import { DateTime } from 'luxon'
import { chain } from 'mathjs'
import KeenSlider from 'keen-slider'
import collapse from '@alpinejs/collapse'

window.Alpine = Alpine

Alpine.plugin(intersect)
Alpine.plugin(collapse)

Alpine.data('drawer', function () {
  return {
    init() {
      document.body.classList.add('overflow-hidden')
    },
    destroy() {
      document.body.classList.remove('overflow-hidden')
      this.$el.remove()
    }
  }
})

Alpine.data('drawer', function () {
  return {
    init() {
      document.body.classList.add('overflow-hidden')
    },
    destroy() {
      document.body.classList.remove('overflow-hidden')
      this.$el.remove()
    }
  }
})

Alpine.data('keenSliderData', () => {
  return {
    tanggal: 12,
    tanggals: [
      {
        date: 11,
        day: "Sen"
      },
      {
        date: 12,
        day: "Sel"
      },
      {
        date: 13,
        day: "Rab"
      },
      {
        date: 14,
        day: "Kam"
      },
      {
        date: 15,
        day: "Jum"
      },
      {
        date: 16,
        day: "Sab"
      },
      {
        date: 17,
        day: "Min"
      },
      {
        date: 18,
        day: "Sen"
      },
      {
        date: 19,
        day: "Sel"
      },
    ],
    dataEvents: [
      {
          date: 12,
          title: "Materi Akuntansi",
          category: "Bidang AN BPKP",
          time: "08:00 - 16:00 WIB",
          status: "Belum mulai",
          noActivity: false,
      },
      {
          date: 19,
          title: "Materi dan Latihan Jurnal Transaksi",
          category: "Bidang AN BPKP",
          time: "08:00 - 16:00 WIB",
          status: "Belum mulai",
          noActivity: false,
      },
      {
          date: 0,
          title: "Tidak Ada Kegiatan",
          category: "BPKP",
          time: "Silahkan pilih tanggal lain",
          status: "",
          noActivity: true,
      },
    ],
    events: [],
    current: 1,
    slider: null,


    changeEvents() {
      const data = this.dataEvents.filter(event => event.date == this.tanggal)
      
      if (data.length > 0) {
        this.events = data;
      } else {
        this.events = [{
            date: 0,
            title: "Tidak Ada Kegiatan",
            category: "BPKP",
            time: "Silahkan pilih tanggal lain",
            status: "",
            noActivity: true,
        }]
      }
    },
    
    init() {
      this.changeEvents();

      this.slider = new KeenSlider(
        '#my-slider',
        {
          loop: true,
          created: () => {
            console.log('created')
          },
          slideChanged: (s) => {
            this.current = s.track.details.rel
          },
          slides: {
            perView: 4,
            spacing: 20,
            initial: this.current,
          },
        },[]
      )
    },
  }
})

Alpine.data('swiperData', function () {
  return {
    swiper: null,

    runSwiper() {
      this.swiper = new Swiper("#swiperContainer", {
        loop: true,
        centeredSlides: true,
        autoplay: {
          delay: 2500,
          disableOnInteraction: false,
        },
        breakpoints: {
          640: {
            slidesPerView: 1,
            spaceBetween: 0,
          },
          768: {
            slidesPerView: 1,
            spaceBetween: 0,
          },
          1024: {
            slidesPerView: 2,
            spaceBetween: 20,
          },
        },
        pagination: {
          el: ".swiper-pagination",
          clickable: true,
        },
        navigation: {
          nextEl: ".swiper-button-next",
          prevEl: ".swiper-button-prev",
        },
      });
    }
  }
})

Alpine.data('modal', function () {
  return {
    closeModal(modal) {
      modal.classList.add('closing')
      modal.addEventListener('animationend', () => modal.remove(), { once: true })
    }
  }
})

Alpine.data('videoPlaceholder', () => {
  return {
    open() {
      document.querySelector('[video-placeholder]').classList.remove('hidden')
    },

    close() {
      console.log('closing video player')
      window.player?.pause()
      document.querySelector('[video-placeholder]').classList.add('hidden')
    }
  }
})

Alpine.data('videoAutoPlayNext', (enabled = true, nextLessonUrl) => {
  return {
    enabled: nextLessonUrl ? enabled : false,
    displayed: false,
    timeRemaining: 100, // start at some number outside threshold
    threshold: 15, // remaining seconds to display countdown

    onTimeUpdate(event) {
      if (!this.enabled) return

      const player = event.detail.player
      const { currentTime, duration } = player
      const remaining = chain(duration).subtract(currentTime).done()

      this.timeRemaining = Math.floor(remaining)
      this.displayed = this.timeRemaining <= this.threshold

      if (this.timeRemaining === 0) {
        this.onPlayNext()
      }
    },

    onPlayNext() {
      if (!this.enabled) return

      window.up.visit(nextLessonUrl + '?autoplay=1')
    },

    onCancel() {
      this.enabled = false
      this.displayed = false
    }
  }
})

Alpine.data('copyToClipboard', (copyText) => {
  return {
    copyText: copyText,
    copyNotification: false,
    copyToClipboard() {
      navigator.clipboard.writeText(this.copyText)
      this.copyNotification = true
      setTimeout(() => this.copyNotification = false, 3000)
    }
  }
})

Alpine.data('comments', function () {
  return {
    editId: null,
    createId: null,
    create(createId) {
      this.cancel()
      this.createId = createId
    },
    edit(editId) {
      this.cancel()
      this.editId = editId
    },
    cancel() {
      this.editId = null
      this.createId = null
    }
  }
})

Alpine.data('turnstile', function () {
  return {
    onRender(sitekey) {
      turnstile.render(this.$el, {
        sitekey,
        callback: function(token) {},
      })
    }
  }
})

window.countdown = function ({ dateTime }) {
  return {
    target: dateTime,
    interval: null,
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,

    init() {
      const target = DateTime.fromISO(dateTime)

      this.interval = setInterval(() => {
        const { milliseconds } = target.diff(DateTime.now(), ['milliseconds'])
        
        this.days = Math.floor(milliseconds / (1000 * 60 * 60 * 24))
        this.hours = Math.floor((milliseconds % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
        this.minutes = Math.floor((milliseconds % (1000 * 60 * 60)) / (1000 * 60))
        this.seconds = Math.floor((milliseconds % (1000 * 60)) / 1000)

        if (!this.days && !this.hours && !this.minutes && !this.seconds) {
          clearInterval(this.interval)
        }
      }, 1000)
    },
    destroy() {
      clearInterval(this.interval)
    }
  }
}

Alpine.start()
