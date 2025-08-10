import React, {useState, useEffect} from 'react'
import PropTypes from "prop-types"
import "../../CSS/FilterModal.css"
import "react-input-range/lib/css/index.css"
import InputRange from "react-input-range"

const FilterModal = ({selectedFilters, onFilterChange, onClose}) => {
    const [priceRange, setPriceRange] = useState ({
        min: selectedFilters.priceRange?.min || 600,
        max: selectedFilters.priceRange?.max || 30000,
    })
    const [propertyType, setPropertyType] = useState (selectedFilters.propertyType || "")
    const [roomType, setRoomType] = useState (selectedFilters.roomType || "")
    const [amenities, setAmenities] = useState (selectedFilters.amenities || [])
    const [priceError, setPriceError] = useState("");
    useEffect (()=>{
        setPriceRange({
            min: selectedFilters.priceRange?.min || 600,
            max: selectedFilters.priceRange?.max || 30000,
        })
        setPropertyType(selectedFilters.propertyType || "")
        setRoomType(selectedFilters.roomType || "")
        setAmenities(selectedFilters.amenities || [])
    }, [selectedFilters])
    const handlePriceRangeChange = (value) => {
        setPriceRange(value);
    }
    const handleMinInputChange = (e) => {
        const value = e.target.value;
        // Allow any string (including empty) while typing
        setPriceRange((prev) => ({...prev, min: value}));
    }
    const handleMaxInputChange = (e) => {
        const value = e.target.value;
        // Allow any string (including empty) while typing
        setPriceRange((prev) => ({...prev, max: value}));
    }
    // On blur, coerce to default if empty and auto-correct if min > max
    const handleMinInputBlur = () => {
        setPriceRange((prev) => {
            let min = prev.min === "" ? 600 : parseInt(prev.min, 10);
            let max = prev.max === "" ? 30000 : parseInt(prev.max, 10);
            if (isNaN(min)) min = 600;
            if (isNaN(max)) max = 30000;
            if (min > max) {
                max = min;
            }
            return { min: String(min), max: String(max) };
        });
    }
    const handleMaxInputBlur = () => {
        setPriceRange((prev) => {
            let min = prev.min === "" ? 600 : parseInt(prev.min, 10);
            let max = prev.max === "" ? 30000 : parseInt(prev.max, 10);
            if (isNaN(min)) min = 600;
            if (isNaN(max)) max = 30000;
            if (max < min) {
                min = max;
            }
            return { min: String(min), max: String(max) };
        });
    }
    const handleFilterChange=()=>{
        // Validate min and max
        let min = priceRange.min === "" ? 600 : parseInt(priceRange.min, 10);
        let max = priceRange.max === "" ? 30000 : parseInt(priceRange.max, 10);
        if (isNaN(min)) min = 600;
        if (isNaN(max)) max = 30000;
        if (min < 600 || max > 30000) {
            setPriceError("Price must be between 600 and 30000.");
            return;
        }
        if (min > max) {
            setPriceError("Min price cannot be greater than max price.");
            return;
        }
        setPriceError("");
        const allFilters = {
            propertyType,
            roomType,
            amenities,
            minPrice: min,
            maxPrice: max,
        };
        onFilterChange(allFilters);
        onClose();
    }
    const propertyTypeOptions = [
        {value:"House", label:"House",icon:"home"},
        {value:"Flat", label:"Flat",icon:"apartment"},
        {value:"Guest House", label:"Guest House",icon:"hotel"},
        {value:"Hotel", label:"Hotel",icon:"meeting_room"},
    ]
    const roomTypeOptions = [
        {value:"Entire Home", label:"Entire Home",icon:"home"},
        {value:"Room", label:"Room",icon:"meeting_room"},
        {value:"Anytype", label:"Anytype",icon:"apartment"},
    ]
    const amenitiesTypeOptions = [
        {value:"Wifi", label:"Wifi",icon:"wifi"},
        {value:"Kitchen", label:"Kitchen",icon:"kitchen"},
        {value:"Ac", label:"AC",icon:"ac_unit"},
        {value:"Washing Machine", label:"Washing Machine",icon:"local_laundry_service"},
        {value:"Tv", label:"Tv",icon:"tv"},
        {value:"Pool", label:"Pool",icon:"pool"},
        {value:"Free Parking", label:"Free Parking",icon:"local_parking"},
    ]
    const handleClearFilters = () => {
        setPriceRange({min:600, max:30000});
        setPropertyType("");
        setRoomType("");
        setAmenities([]);
    }
    const handleAmenitiesChange=(selectedAmenity)=>{
        setAmenities((prevAmenities) =>
            prevAmenities.includes(selectedAmenity)
            ? prevAmenities.filter((item)=>item!==selectedAmenity)
            : [...prevAmenities, selectedAmenity]
        );
    }
    const handlePropertyTypeChange = (selectedType) => {
        setPropertyType((prevType) => 
            prevType===selectedType?"":selectedType
        )
    }
    const handleRoomTypeChange = (selectedType) => {
        setRoomType((prevType) => 
            prevType===selectedType?"":selectedType
        )
    }
  return (
    <div className='modal-backdrop'>
        <div className='modal-content'>
            <h4>Filters<hr/></h4>        
            <button className='close-button' onClick={onClose}>
                <span>&times;</span>
            </button>
            <div className='modal-filters-container'>
                <div className='filter-section price-range-section'>
                    <label>Price range:</label>
                    <InputRange
                    minValue={600}
                    maxValue={30000}
                    value={priceRange}
                    onChange={handlePriceRangeChange}
                    />
                    <div className="price-inputs">
                        <input
                            type='number'
                            placeholder="Min Price"
                            value={priceRange.min}
                            onChange={handleMinInputChange}
                            onBlur={handleMinInputBlur}
                            min="600"
                            max={priceRange.max}
                        />
                        <span style={{alignSelf: 'center', fontWeight: 'bold'}}>to</span>
                        <input
                            type='number'
                            placeholder="Max Price"
                            value={priceRange.max}
                            onChange={handleMaxInputChange}
                            onBlur={handleMaxInputBlur}
                            min={priceRange.min}
                            max="30000"
                        />
                    </div>
                    {priceError && <p className="error-message">{priceError}</p>}
                </div>
                <div className='filter-section'>
                    <label>Property Type: </label>
                    <div className='icon-box'>
                        {propertyTypeOptions.map((options)=>(
                            <div key={options.value} 
                            className={`selectable-box ${propertyType === options.value ? "selected":""}`}
                            onClick={()=>handlePropertyTypeChange(options.value)}
                            >
                                <span className='material-icons'>{options.icon}</span>
                                <span>{options.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className='filter-section'>
                    <label>Room Type: </label>
                    <div className='icon-box'>
                        {roomTypeOptions.map((options)=>(
                            <div key={options.value} 
                            className={`selectable-box ${roomType === options.value ? "selected":""}`}
                            onClick={()=>handleRoomTypeChange(options.value)}
                            >
                                <span className='material-icons'>{options.icon}</span>
                                <span>{options.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className='filter-section'>
                    <label>Amenities:</label>
                    <div className='amenities-checkboxes'>
                        {amenitiesTypeOptions.map((option)=>(
                            <div key={option.value} className="amenity-checkbox">          
                                {console.log(amenities.includes(option.value))}
                                <input
                                type='checkbox'
                                value={option.value}
                                checked={amenities.includes(option.value)}
                                onChange={()=>handleAmenitiesChange(option.value)}
                                />
                                <span className='material-icons amenitieslabel'>{option.icon}</span>
                                <span>{option.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
                <div className='filter-buttons'>
                    <button className='clear-button' onClick={handleClearFilters}>Clear</button>
                    <button onClick={handleFilterChange}>Apply Filters</button>
                </div>
            </div>
        </div>
    </div>
  )
}

FilterModal.propTypes = {
    selectedFilters:PropTypes.object.isRequired,
    onFilterChange:PropTypes.func.isRequired,
    onClose:PropTypes.func.isRequired,
}

export default FilterModal