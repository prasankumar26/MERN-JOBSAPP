import logo from '../assets/images/favicon.ico'
import styled from 'styled-components'

const Logo = () => {
  return (
   <>
   <Wrapper>

    <div className="logo_box">
    <img src={logo} alt='jobify' className='logo' />
   <span className='logo_new'>SaveJobs</span>
    </div>
   
   </Wrapper>
   </>
  )
}

export default Logo


const Wrapper = styled.div`
.logo_box{
  display: flex;
  align-items: center;
}
.logo_new{
 color: #e86f1f;
 margin-left: 20px;
 font-size: 30px;
 font-weight: bold;
 text-transform: uppercase;
 display: none;
}


@media only screen  and (max-width: 998px){
.logo{
  width: 50px !important;
}
.logo_new{
  font-size: 16px;
  margin-right: 10px;
  display: block;
}
}

`
