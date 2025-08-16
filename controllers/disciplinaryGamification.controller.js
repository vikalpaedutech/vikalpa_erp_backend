//This handles the disciplinary part of the gamification.
//This will use the utils of disciplinary, 

import { awardPoints } from "../utils/gamification.utils.js"

export const disciplinaryGamification = (req, res) =>{

console.log('hellow route')

    //Handling gamification point for disciplinary.
            
    // const date = loginTime

          const keyValue = "disciplinary"

          const AwardPoints = awardPoints({keyValue})

    //------------------------------------------------------------




console.log(req.query)


console.log(new Date())

}