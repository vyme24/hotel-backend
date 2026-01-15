const Hotel = require('../../models/Hotel');

const getAll = async(req,res) => {

   try {
      const hotels = await Hotel.find({});
      if(!hotels){
        throw new Error("Not Found!")

      }


    res.status(200).json({ status: 'success', message: 'Hotels fetched successful' , data: hotels });

    
   } catch (error) {
    return res.status(500).json(error.message || "Server Error")
   }
}

const get = async(req,res) => { 
    try {
        const hotel = await Hotel.findById(req.params.id);
        if(!hotel){
          throw new Error("Not Found!")
    
        }

      res.status(200).json({ status: 'success', message: 'Hotel fetched' , data: hotel });
    }
    catch (error) {
        return res.status(500).json(error.message || "Server Error")
    
    }



}


module.exports = {
    getAll,
    get
}