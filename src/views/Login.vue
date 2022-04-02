<template>
  <div class="login-container">
    <!-- <div >登录</div>
    <input type="mobile" v-model="mobile">
    <button @click="submit">提交</button>

    <a-input default-value="mysite">
      <a-icon slot="addonAfter" type="setting" />
    </a-input> -->
    <a-row style="width: 100%; height: 100%;" justify="space-around" type="flex">
      <a-col :xs="20" :sm="18" :md="16" :lg="10" :xl="10" class="card">
        <div class="head">
          eReader
        </div>
        <a-input prefix="+" class="item"  size="large" placeholder="Enter phone number here"  v-model="mobile" :maxLength="11" type="mobile" :allowClear="true"></a-input>
        <a-row class="item line" >
          <a-col :span="14">
            <a-input  size="large" placeholder="Click for auth code" v-model="code" :maxLength="6"></a-input>
          </a-col>
          <a-col :span="8" :offset="2">
            <a-button block size="large" @click="getCode" id="sign-in-button" :loading="codeLoding">
            {{codeMsg}}
            </a-button>
          </a-col>
        </a-row>
        <a-row class="item line">
          <a-button block size="large" type="primary" @click="submit" :disabled="submitDisabled">
            Submit
          </a-button>
        </a-row>
      </a-col>
    </a-row>

  </div>
</template>
<script>
import { getAuth, signInWithPhoneNumber } from 'firebase/auth'
import { message } from 'ant-design-vue'
export default{
  name: 'login',
  data () {
    return {
      mobile: '',
      codeLoding: false,
      codeMsg: 'Get',
      codeTimer: null,
      code: '',
      submitDisabled: true
    }
  },

  methods: {
    submit () {
      let checked = true

      if (this.mobile.length !== 11) {
        message.error('Please enter the correct phone number')
        checked = false
      }
      if (this.code.length !== 6) {
        message.error('Please enter correct verify code')
        checked = false
      }
      if (checked) {
        const code = this.code
        window.confirmationResult.confirm(code).then((result) => {
          // User signed in successfully.
          const user = result.user
          message.info('User login successfully')
          let dict = {}
          for (let key in user) {
            this.session.set(key, JSON.stringify(user[key]))
            dict[key] = JSON.stringify(user[key])
          }
          this.$fs.set('users', JSON.stringify(user.uid), dict)
          this.$router.push('/booklist')
          // ...
        }).catch((error) => {
          // User couldn't sign in (bad verification code?)
          // ...
          console.log(error)
          if (error.code) {
            message.error(error.code)
          } else {
            message.error('User login failed')
          }
        })
      }
    },
    getCode () {
      this.codeLoding = true

      const phoneNumber = this.mobile[0] === '+' ? this.mobile : '+' + this.mobile
      const appVerifier = window.recaptchaVerifier

      console.log(phoneNumber)
      const auth = getAuth()
      signInWithPhoneNumber(auth, phoneNumber, appVerifier)
        .then((confirmationResult) => {
          // SMS sent. Prompt user to type the code from the message, then sign the
          // user in with confirmationResult.confirm(code).
          window.confirmationResult = confirmationResult
          this.codeMsg = '60'
          this.submitDisabled = false
          this.codeTimer = setInterval(() => {
            this.codeMsg = parseInt(this.codeMsg) - 1 + ''
            if (parseInt(this.codeMsg) === 0) {
              // grecaptcha.reset('sign-in-button');
              window.recaptchaVerifier.render().then((widgetId) => {
                // eslint-disable-next-line no-undef
                grecaptcha.reset(widgetId)
              })
              clearInterval(this.codeTimer)
              this.codeTimer = null
              this.codeMsg = 'Get'
            }
          }, 1000)
          // ...
        }).catch((error) => {
          console.log(error)
          this.codeLoding = false
          this.submitDisabled = true
          // Error; SMS not sent
          // ...
          if (error.code) {
            message.error(error.code)
          } else {
            message.error('An exception error occurred')
          }
        })
    }
  },
  watch: {
    codeMsg (val) {
      if (val !== 'Get' && parseInt(val) !== 0) {
        this.codeLoding = true
      } else {
        this.codeLoding = false
      }
    }
  },
  mounted () {
    console.log(this.app)
    setTimeout(() => {
      let auth = this.getAuth(this.app)
      window.recaptchaVerifier = new this.RecaptchaVerifier('sign-in-button', {
        'size': 'invisible',
        'callback': (response) => {
        // reCAPTCHA solved, allow signInWithPhoneNumber.
          console.log(response)
        }
      }, auth)
    })
  }
}
</script>

<style>
  .login-container{
    position: relative;
    display: flex;
    height: 100%;
    background: linear-gradient(15deg, #13547a 0%, #80d0c7 100%);
  }
  .card{
    border: 1px solid transparent;
    height: 80%;
    margin: auto;
    border-radius: 20px;
    box-shadow: #000 10px 10px 71px -10px
  }
  .head{
    margin-top: 60px;
    font-size: 39px;
    font-weight: 900;
    margin-bottom: 62px;
  }
  .item{
    width: 70%;
    margin: auto;
  }
  .line{
    margin-top: 25px;
  }
</style>
